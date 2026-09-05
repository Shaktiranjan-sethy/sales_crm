import { body } from "express-validator";
import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import { AppError } from "../middleware/error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { parseListQuery, listResponse } from "../utils/pagination.js";
import { assignedFilter, canAccessRecord, isManager } from "../utils/access.js";
import { addTimeline, notify } from "../services/events.js";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
} from "../utils/constants.js";

const createValidators = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("source").isIn(LEAD_SOURCES).withMessage("Invalid lead source"),
  body("priority").optional().isIn(LEAD_PRIORITIES),
  body("status").optional().isIn(["new", "contacted", "qualified", "lost"]),
];

function buildLeadFilter(req) {
  const filter = { ...assignedFilter(req.user) };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.source) filter.source = req.query.source;
  if (req.query.assignedTo && isManager(req.user)) filter.assignedTo = req.query.assignedTo;
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }
  if (req.query.search) {
    const rx = new RegExp(req.query.search, "i");
    filter.$or = [
      { firstName: rx },
      { lastName: rx },
      { email: rx },
      { company: rx },
      { phone: rx },
    ];
  }
  return filter;
}

const listLeads = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parseListQuery(req.query);
  const filter = buildLeadFilter(req);
  const [items, total] = await Promise.all([
    Lead.find(filter).populate("assignedTo", "name email role").sort(sort).skip(skip).limit(limit),
    Lead.countDocuments(filter),
  ]);
  res.json(listResponse(items, total, page, limit));
});

const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id).populate("assignedTo", "name email role");
  if (!lead) throw new AppError("Lead not found", 404);
  if (!canAccessRecord(req.user, lead.assignedTo._id || lead.assignedTo)) {
    throw new AppError("You cannot access this lead", 403);
  }
  res.json({ lead });
});

const createLead = asyncHandler(async (req, res) => {
  validate(req);
  const assignedTo = req.body.assignedTo || req.user.id;
  if (!isManager(req.user) && String(assignedTo) !== req.user.id) {
    throw new AppError("Executives can only create leads for themselves", 403);
  }
  const lead = await Lead.create({ ...req.body, assignedTo });
  await addTimeline({
    entityType: "lead",
    entityId: lead._id,
    action: "created",
    message: `Lead ${lead.firstName} ${lead.lastName} created`,
    actor: req.user.id,
  });
  if (String(assignedTo) !== req.user.id) {
    await notify({
      user: assignedTo,
      title: "Lead assigned",
      message: `${lead.firstName} ${lead.lastName} was assigned to you`,
      type: "lead_assignment",
      link: `/leads/${lead._id}`,
    });
  }
  const populated = await lead.populate("assignedTo", "name email role");
  res.status(201).json({ lead: populated });
});

const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new AppError("Lead not found", 404);
  if (!canAccessRecord(req.user, lead.assignedTo)) {
    throw new AppError("You cannot update this lead", 403);
  }
  if (lead.status === "converted") {
    throw new AppError("Converted leads cannot be edited", 400);
  }

  const prevStatus = lead.status;
  const prevPriority = lead.priority;
  const prevAssignee = String(lead.assignedTo);

  const allowed = ["firstName", "lastName", "email", "phone", "company", "source", "status", "priority", "notes"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) lead[key] = req.body[key];
  });
  if (lead.status === "converted") {
    throw new AppError("Use convert endpoint to convert a lead", 400);
  }

  if (req.body.assignedTo && String(req.body.assignedTo) !== prevAssignee) {
    if (!isManager(req.user)) {
      throw new AppError("Only managers can reassign leads", 403);
    }
    lead.assignedTo = req.body.assignedTo;
    await addTimeline({
      entityType: "lead",
      entityId: lead._id,
      action: "reassigned",
      message: "Lead reassigned",
      metadata: { from: prevAssignee, to: String(req.body.assignedTo) },
      actor: req.user.id,
    });
    await notify({
      user: req.body.assignedTo,
      title: "Lead assigned",
      message: `${lead.firstName} ${lead.lastName} was assigned to you`,
      type: "lead_assignment",
      link: `/leads/${lead._id}`,
    });
  }

  await lead.save();

  if (req.body.status && req.body.status !== prevStatus) {
    await addTimeline({
      entityType: "lead",
      entityId: lead._id,
      action: "status_changed",
      message: `Status changed from ${prevStatus} to ${lead.status}`,
      actor: req.user.id,
    });
  }
  if (req.body.priority && req.body.priority !== prevPriority) {
    await addTimeline({
      entityType: "lead",
      entityId: lead._id,
      action: "priority_changed",
      message: `Priority changed from ${prevPriority} to ${lead.priority}`,
      actor: req.user.id,
    });
  }
  if (req.body.notes !== undefined) {
    await addTimeline({
      entityType: "lead",
      entityId: lead._id,
      action: "note_added",
      message: "Lead notes updated",
      actor: req.user.id,
    });
  }

  const populated = await lead.populate("assignedTo", "name email role");
  res.json({ lead: populated });
});

const convertLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new AppError("Lead not found", 404);
  if (!canAccessRecord(req.user, lead.assignedTo)) {
    throw new AppError("You cannot convert this lead", 403);
  }
  if (lead.status === "converted" || lead.convertedToCustomer) {
    throw new AppError("Lead has already been converted", 409);
  }
  if (lead.status !== "qualified") {
    throw new AppError("Only qualified leads can be converted", 400);
  }

  const { title, value, probability, expectedCloseDate, notes } = req.body;
  if (!title || value === undefined || probability === undefined || !expectedCloseDate) {
    throw new AppError("Deal title, value, probability and expected close date are required", 422);
  }
  const numValue = Number(value);
  const numProb = Number(probability);
  if (Number.isNaN(numValue) || numValue < 0) throw new AppError("Deal value must be 0 or more", 422);
  if (Number.isNaN(numProb) || numProb < 0 || numProb > 100) {
    throw new AppError("Probability must be between 0 and 100", 422);
  }

  const customer = await Customer.create({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    assignedTo: lead.assignedTo,
    lead: lead._id,
    notes: notes || lead.notes,
  });

  const deal = await Deal.create({
    title,
    value: numValue,
    probability: numProb,
    stage: "qualification",
    expectedCloseDate,
    assignedTo: lead.assignedTo,
    customer: customer._id,
    lead: lead._id,
    notes: notes || "",
  });

  lead.status = "converted";
  lead.convertedToCustomer = customer._id;
  lead.convertedAt = new Date();
  await lead.save();

  await addTimeline({
    entityType: "lead",
    entityId: lead._id,
    action: "converted",
    message: "Lead converted to customer",
    metadata: { customerId: customer._id, dealId: deal._id },
    actor: req.user.id,
  });
  await addTimeline({
    entityType: "customer",
    entityId: customer._id,
    action: "created",
    message: "Customer created from converted lead",
    metadata: { leadId: lead._id },
    actor: req.user.id,
  });
  await addTimeline({
    entityType: "deal",
    entityId: deal._id,
    action: "created",
    message: `Deal "${deal.title}" created from converted lead`,
    metadata: { leadId: lead._id, customerId: customer._id },
    actor: req.user.id,
  });

  await notify({
    user: lead.assignedTo,
    title: "Lead converted",
    message: `${lead.firstName} ${lead.lastName} is now a customer`,
    type: "lead_conversion",
    link: `/customers/${customer._id}`,
  });

  res.status(201).json({ lead, customer, deal });
});

const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) throw new AppError("Lead not found", 404);
  if (!canAccessRecord(req.user, lead.assignedTo)) {
    throw new AppError("You cannot delete this lead", 403);
  }
  if (lead.status === "converted") {
    throw new AppError("Cannot delete converted leads", 400);
  }
  await Lead.findByIdAndDelete(lead._id);
  res.json({ message: "Lead deleted successfully" });
});

export {
  listLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
  createValidators,
};
