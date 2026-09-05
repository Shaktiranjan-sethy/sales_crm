import Deal from "../models/Deal.js";
import { AppError } from "../middleware/error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseListQuery, listResponse } from "../utils/pagination.js";
import { assignedFilter, canAccessRecord, isManager } from "../utils/access.js";
import { addTimeline, notify } from "../services/events.js";
import { DEAL_TRANSITIONS } from "../utils/constants.js";

function buildDealFilter(req) {
  const filter = { ...assignedFilter(req.user) };
  if (req.query.stage) filter.stage = req.query.stage;
  if (req.query.assignedTo && isManager(req.user)) filter.assignedTo = req.query.assignedTo;
  if (req.query.minAmount || req.query.maxAmount) {
    filter.value = {};
    if (req.query.minAmount) filter.value.$gte = Number(req.query.minAmount);
    if (req.query.maxAmount) filter.value.$lte = Number(req.query.maxAmount);
  }
  if (req.query.closeFrom || req.query.closeTo) {
    filter.expectedCloseDate = {};
    if (req.query.closeFrom) filter.expectedCloseDate.$gte = new Date(req.query.closeFrom);
    if (req.query.closeTo) filter.expectedCloseDate.$lte = new Date(req.query.closeTo);
  }
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }
  if (req.query.search) {
    filter.title = new RegExp(req.query.search, "i");
  }
  return filter;
}

const listDeals = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parseListQuery(req.query);
  const filter = buildDealFilter(req);
  const [items, total] = await Promise.all([
    Deal.find(filter)
      .populate("assignedTo", "name email role")
      .populate("customer", "firstName lastName company")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Deal.countDocuments(filter),
  ]);
  res.json(listResponse(items, total, page, limit));
});

const getDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id)
    .populate("assignedTo", "name email role")
    .populate("customer")
    .populate("lead");
  if (!deal) throw new AppError("Deal not found", 404);
  if (!canAccessRecord(req.user, deal.assignedTo._id || deal.assignedTo)) {
    throw new AppError("You cannot access this deal", 403);
  }
  res.json({ deal });
});

const updateDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) throw new AppError("Deal not found", 404);
  if (!canAccessRecord(req.user, deal.assignedTo)) {
    throw new AppError("You cannot update this deal", 403);
  }
  if (deal.stage === "won" || deal.stage === "lost") {
    throw new AppError("Closed deals cannot be modified", 400);
  }

  const prevStage = deal.stage;
  const prevAssignee = String(deal.assignedTo);

  if (req.body.value !== undefined) {
    const value = Number(req.body.value);
    if (Number.isNaN(value) || value < 0) throw new AppError("Deal value must be 0 or more", 422);
    deal.value = value;
  }
  if (req.body.probability !== undefined) {
    const probability = Number(req.body.probability);
    if (Number.isNaN(probability) || probability < 0 || probability > 100) {
      throw new AppError("Probability must be between 0 and 100", 422);
    }
    deal.probability = probability;
  }
  if (req.body.title) deal.title = req.body.title;
  if (req.body.expectedCloseDate) deal.expectedCloseDate = req.body.expectedCloseDate;
  if (req.body.notes !== undefined) deal.notes = req.body.notes;

  if (req.body.assignedTo && String(req.body.assignedTo) !== prevAssignee) {
    if (!isManager(req.user)) throw new AppError("Only managers can reassign deals", 403);
    deal.assignedTo = req.body.assignedTo;
    await addTimeline({
      entityType: "deal",
      entityId: deal._id,
      action: "reassigned",
      message: "Deal reassigned",
      metadata: { from: prevAssignee, to: String(req.body.assignedTo) },
      actor: req.user.id,
    });
    await notify({
      user: req.body.assignedTo,
      title: "Deal assigned",
      message: `Deal "${deal.title}" was assigned to you`,
      type: "deal_assignment",
      link: `/deals/${deal._id}`,
    });
  }

  if (req.body.stage && req.body.stage !== prevStage) {
    const allowed = DEAL_TRANSITIONS[prevStage] || [];
    if (!allowed.includes(req.body.stage)) {
      throw new AppError(
        `Invalid stage transition from ${prevStage} to ${req.body.stage}`,
        400
      );
    }
    deal.stage = req.body.stage;
    if (deal.stage === "won") {
      deal.probability = 100;
      deal.closedAt = new Date();
      deal.closeReason = req.body.closeReason || "Won";
    }
    if (deal.stage === "lost") {
      deal.probability = 0;
      deal.closedAt = new Date();
      deal.closeReason = req.body.closeReason || "Lost";
    }
    await addTimeline({
      entityType: "deal",
      entityId: deal._id,
      action: deal.stage === "won" || deal.stage === "lost" ? "closed" : "stage_changed",
      message: `Stage changed from ${prevStage} to ${deal.stage}`,
      metadata: { closeReason: deal.closeReason },
      actor: req.user.id,
    });
    if (deal.stage === "won" || deal.stage === "lost") {
      await notify({
        user: deal.assignedTo,
        title: "Deal closed",
        message: `Deal "${deal.title}" marked as ${deal.stage}`,
        type: "deal_closure",
        link: `/deals/${deal._id}`,
      });
    }
  }

  await deal.save();
  const populated = await deal.populate([
    { path: "assignedTo", select: "name email role" },
    { path: "customer" },
  ]);
  res.json({ deal: populated });
});

const createDeal = asyncHandler(async (req, res) => {
  const { title, value, probability, expectedCloseDate, customer, notes } = req.body;
  if (!title || value === undefined || probability === undefined || !expectedCloseDate || !customer) {
    throw new AppError("Title, value, probability, expected close date and customer are required", 422);
  }
  const assignedTo = req.body.assignedTo || req.user.id;
  if (!isManager(req.user) && String(assignedTo) !== req.user.id) {
    throw new AppError("You can only create deals for yourself", 403);
  }
  const deal = await Deal.create({
    title,
    value: Number(value),
    probability: Number(probability),
    expectedCloseDate,
    assignedTo,
    customer,
    lead: req.body.lead || undefined,
    notes: notes || "",
    stage: "qualification",
  });
  await addTimeline({
    entityType: "deal",
    entityId: deal._id,
    action: "created",
    message: `Deal "${deal.title}" created`,
    actor: req.user.id,
  });
  res.status(201).json({ deal });
});

const deleteDeal = asyncHandler(async (req, res) => {
  const deal = await Deal.findById(req.params.id);
  if (!deal) throw new AppError("Deal not found", 404);
  if (!canAccessRecord(req.user, deal.assignedTo)) {
    throw new AppError("You cannot delete this deal", 403);
  }
  if (deal.stage === "won" || deal.stage === "lost") {
    throw new AppError("Cannot delete closed deals", 400);
  }
  await Deal.findByIdAndDelete(deal._id);
  res.json({ message: "Deal deleted successfully" });
});

export { listDeals, getDeal, createDeal, updateDeal, deleteDeal };
