import { body } from "express-validator";
import Activity from "../models/Activity.js";
import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import { AppError } from "../middleware/error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { parseListQuery, listResponse } from "../utils/pagination.js";
import { assignedFilter, canAccessRecord, isManager } from "../utils/access.js";
import { addTimeline, notify } from "../services/events.js";
import { markOverdueActivities } from "../services/activities.js";
import { ACTIVITY_TYPES, ENTITY_TYPES } from "../utils/constants.js";

const createValidators = [
  body("type").isIn(ACTIVITY_TYPES).withMessage("Invalid activity type"),
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("dueAt").notEmpty().withMessage("Due date is required"),
  body("entityType").isIn(ENTITY_TYPES).withMessage("Invalid entity type"),
  body("entityId").notEmpty().withMessage("Related record is required"),
];

async function assertEntityAccess(user, entityType, entityId) {
  const models = { lead: Lead, customer: Customer, deal: Deal };
  const Model = models[entityType];
  const record = await Model.findById(entityId);
  if (!record) throw new AppError(`${entityType} not found`, 404);
  if (!canAccessRecord(user, record.assignedTo)) {
    throw new AppError("You cannot add activities to this record", 403);
  }
  return record;
}

const listActivities = asyncHandler(async (req, res) => {
  await markOverdueActivities();
  const { page, limit, skip, sort } = parseListQuery(req.query);
  const filter = { ...assignedFilter(req.user) };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.entityType && req.query.entityId) {
    filter.entityType = req.query.entityType;
    filter.entityId = req.query.entityId;
  }
  if (req.query.assignedTo && isManager(req.user)) filter.assignedTo = req.query.assignedTo;
  const [items, total] = await Promise.all([
    Activity.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Activity.countDocuments(filter),
  ]);
  res.json(listResponse(items, total, page, limit));
});

const createActivity = asyncHandler(async (req, res) => {
  validate(req);
  const record = await assertEntityAccess(req.user, req.body.entityType, req.body.entityId);
  const assignedTo = req.body.assignedTo || record.assignedTo;
  const activity = await Activity.create({
    type: req.body.type,
    title: req.body.title,
    description: req.body.description || "",
    dueAt: req.body.dueAt,
    entityType: req.body.entityType,
    entityId: req.body.entityId,
    assignedTo,
    createdBy: req.user.id,
  });
  await addTimeline({
    entityType: req.body.entityType,
    entityId: req.body.entityId,
    action: "followup_created",
    message: `${activity.type} follow-up created: ${activity.title}`,
    actor: req.user.id,
  });
  await notify({
    user: assignedTo,
    title: "Upcoming follow-up",
    message: `${activity.title} is scheduled`,
    type: "upcoming_followup",
    link: `/activities`,
  });
  res.status(201).json({ activity });
});

const getActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");
  if (!activity) throw new AppError("Activity not found", 404);
  if (!canAccessRecord(req.user, activity.assignedTo) && String(activity.createdBy) !== req.user.id) {
    throw new AppError("You cannot access this activity", 403);
  }
  res.json({ activity });
});

const updateActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) throw new AppError("Activity not found", 404);
  if (!canAccessRecord(req.user, activity.assignedTo) && String(activity.createdBy) !== req.user.id) {
    throw new AppError("You cannot update this activity", 403);
  }
  if (req.body.status === "completed") {
    activity.status = "completed";
    activity.completedAt = new Date();
  }
  if (req.body.title) activity.title = req.body.title;
  if (req.body.description !== undefined) activity.description = req.body.description;
  if (req.body.dueAt) activity.dueAt = req.body.dueAt;
  await activity.save();
  await addTimeline({
    entityType: activity.entityType,
    entityId: activity.entityId,
    action: "followup_updated",
    message: `Follow-up ${activity.status}: ${activity.title}`,
    actor: req.user.id,
  });
  res.json({ activity });
});

const deleteActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) throw new AppError("Activity not found", 404);
  if (!canAccessRecord(req.user, activity.assignedTo) && String(activity.createdBy) !== req.user.id) {
    throw new AppError("You cannot delete this activity", 403);
  }
  await Activity.findByIdAndDelete(activity._id);
  res.json({ message: "Activity deleted successfully" });
});

export { listActivities, getActivity, createActivity, updateActivity, deleteActivity, createValidators };
