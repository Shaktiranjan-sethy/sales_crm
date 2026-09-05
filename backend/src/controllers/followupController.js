import Activity from "../models/Activity.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseListQuery, listResponse } from "../utils/pagination.js";
import { assignedFilter, isManager } from "../utils/access.js";
import { markOverdueActivities } from "../services/activities.js";

const listFollowups = asyncHandler(async (req, res) => {
  await markOverdueActivities();
  const { page, limit, skip, sort } = parseListQuery(req.query);
  const filter = { 
    ...assignedFilter(req.user),
    type: { $in: ["call", "email", "meeting", "demo"] } // Followups are activities except reminders
  };
  
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
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

export { listFollowups };
