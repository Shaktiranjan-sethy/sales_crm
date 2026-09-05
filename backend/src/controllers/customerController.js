import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import { AppError } from "../middleware/error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseListQuery, listResponse } from "../utils/pagination.js";
import { assignedFilter, canAccessRecord, isManager } from "../utils/access.js";
import { addTimeline } from "../services/events.js";

const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parseListQuery(req.query);
  const filter = { ...assignedFilter(req.user) };
  if (req.query.assignedTo && isManager(req.user)) filter.assignedTo = req.query.assignedTo;
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }
  if (req.query.search) {
    const rx = new RegExp(req.query.search, "i");
    filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }, { company: rx }];
  }

  let customers = await Customer.find(filter)
    .populate("assignedTo", "name email role")
    .populate("lead", "status source")
    .sort(sort)
    .skip(skip)
    .limit(limit);

  if (req.query.dealStatus) {
    const ids = customers.map((c) => c._id);
    const deals = await Deal.find({ customer: { $in: ids }, stage: req.query.dealStatus }).select("customer");
    const allowed = new Set(deals.map((d) => String(d.customer)));
    customers = customers.filter((c) => allowed.has(String(c._id)));
  }

  const total = req.query.dealStatus
    ? customers.length
    : await Customer.countDocuments(filter);

  res.json(listResponse(customers, total, page, limit));
});

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id)
    .populate("assignedTo", "name email role")
    .populate("lead");
  if (!customer) throw new AppError("Customer not found", 404);
  if (!canAccessRecord(req.user, customer.assignedTo._id || customer.assignedTo)) {
    throw new AppError("You cannot access this customer", 403);
  }
  const deals = await Deal.find({ customer: customer._id });
  res.json({ customer, deals });
});

const createCustomer = asyncHandler(async (req, res) => {
  const assignedTo = req.body.assignedTo || req.user.id;
  if (!isManager(req.user) && String(assignedTo) !== req.user.id) {
    throw new AppError("You can only create customers for yourself", 403);
  }
  if (!req.body.firstName || !req.body.lastName || !req.body.email) {
    throw new AppError("First name, last name and email are required", 422);
  }
  const customer = await Customer.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    company: req.body.company,
    assignedTo,
    lead: req.body.lead || undefined,
    notes: req.body.notes || "",
  });
  await addTimeline({
    entityType: "customer",
    entityId: customer._id,
    action: "created",
    message: "Customer created",
    actor: req.user.id,
  });
  res.status(201).json({ customer });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new AppError("Customer not found", 404);
  if (!canAccessRecord(req.user, customer.assignedTo)) {
    throw new AppError("You cannot update this customer", 403);
  }
  const allowed = ["firstName", "lastName", "email", "phone", "company", "notes"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) customer[key] = req.body[key];
  });
  await customer.save();
  await addTimeline({
    entityType: "customer",
    entityId: customer._id,
    action: "updated",
    message: "Customer details updated",
    actor: req.user.id,
  });
  res.json({ customer });
});

const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new AppError("Customer not found", 404);
  if (!canAccessRecord(req.user, customer.assignedTo)) {
    throw new AppError("You cannot delete this customer", 403);
  }
  const relatedDeals = await Deal.countDocuments({ customer: customer._id });
  if (relatedDeals > 0) {
    throw new AppError("Cannot delete customer with existing deals", 400);
  }
  await Customer.findByIdAndDelete(customer._id);
  res.json({ message: "Customer deleted successfully" });
});

export { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
