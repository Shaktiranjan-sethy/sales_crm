import TimelineEvent from "../models/TimelineEvent.js";
import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import { AppError } from "../middleware/error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { canAccessRecord } from "../utils/access.js";

const getTimeline = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;
  const models = { lead: Lead, customer: Customer, deal: Deal };
  const Model = models[entityType];
  if (!Model) throw new AppError("Invalid entity type", 400);
  const record = await Model.findById(entityId);
  if (!record) throw new AppError("Record not found", 404);
  if (!canAccessRecord(req.user, record.assignedTo)) {
    throw new AppError("You cannot view this timeline", 403);
  }
  const events = await TimelineEvent.find({ entityType, entityId })
    .populate("actor", "name email role")
    .sort({ createdAt: -1 });
  res.json({ events });
});

export { getTimeline };
