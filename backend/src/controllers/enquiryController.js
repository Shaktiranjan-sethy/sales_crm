import Lead from "../models/Lead.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parseListQuery, listResponse } from "../utils/pagination.js";
import { assignedFilter } from "../utils/access.js";

const listEnquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parseListQuery(req.query);
  const filter = { 
    ...assignedFilter(req.user),
    status: { $in: ["new", "contacted"] } // Enquiries are new or contacted leads
  };
  
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.source) filter.source = req.query.source;
  if (req.query.search) {
    filter.$or = [
      { firstName: new RegExp(req.query.search, "i") },
      { lastName: new RegExp(req.query.search, "i") },
      { email: new RegExp(req.query.search, "i") },
      { company: new RegExp(req.query.search, "i") },
    ];
  }
  
  const [items, total] = await Promise.all([
    Lead.find(filter)
      .populate("assignedTo", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Lead.countDocuments(filter),
  ]);
  
  res.json(listResponse(items, total, page, limit));
});

export { listEnquiries };
