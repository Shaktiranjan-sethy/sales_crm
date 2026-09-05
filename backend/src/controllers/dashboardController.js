import Lead from "../models/Lead.js";
import Customer from "../models/Customer.js";
import Deal from "../models/Deal.js";
import Activity from "../models/Activity.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assignedFilter, assignedMatch } from "../utils/access.js";
import { markOverdueActivities } from "../services/activities.js";

const getDashboard = asyncHandler(async (req, res) => {
  await markOverdueActivities();
  const scope = assignedFilter(req.user);
  const aggScope = assignedMatch(req.user);
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalLeads,
    newLeads,
    qualifiedLeads,
    convertedLeads,
    lostLeads,
    totalCustomers,
    newCustomers,
    totalDeals,
    openDeals,
    wonDeals,
    lostDeals,
    pendingActivities,
    completedActivities,
    overdueActivities,
    pipelineAgg,
    wonAgg,
    expectedAgg,
  ] = await Promise.all([
    Lead.countDocuments(scope),
    Lead.countDocuments({ ...scope, status: "new" }),
    Lead.countDocuments({ ...scope, status: "qualified" }),
    Lead.countDocuments({ ...scope, status: "converted" }),
    Lead.countDocuments({ ...scope, status: "lost" }),
    Customer.countDocuments(scope),
    Customer.countDocuments({ ...scope, createdAt: { $gte: monthStart } }),
    Deal.countDocuments(scope),
    Deal.countDocuments({ ...scope, stage: { $nin: ["won", "lost"] } }),
    Deal.countDocuments({ ...scope, stage: "won" }),
    Deal.countDocuments({ ...scope, stage: "lost" }),
    Activity.countDocuments({ ...scope, status: "pending" }),
    Activity.countDocuments({ ...scope, status: "completed" }),
    Activity.countDocuments({ ...scope, status: "overdue" }),
    Deal.aggregate([
      { $match: { ...aggScope, stage: { $nin: ["won", "lost"] } } },
      { $group: { _id: null, value: { $sum: "$value" }, expected: { $sum: "$expectedRevenue" } } },
    ]),
    Deal.aggregate([
      { $match: { ...aggScope, stage: "won" } },
      { $group: { _id: null, value: { $sum: "$value" } } },
    ]),
    Deal.aggregate([
      { $match: { ...aggScope, stage: { $nin: ["won", "lost"] } } },
      { $group: { _id: null, value: { $sum: "$expectedRevenue" } } },
    ]),
  ]);

  const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 1000) / 10 : 0;
  const pipelineByStage = await Deal.aggregate([
    { $match: { ...aggScope } },
    { $group: { _id: "$stage", count: { $sum: 1 }, value: { $sum: "$value" } } },
  ]);

  let team = [];
  // Check if user has view_team_performance permission
  const userRole = await Role.findById(req.user.role);
  const canViewTeam = userRole?.permissions?.includes("view_team_performance");

  if (canViewTeam) {
    const execs = await User.find({
      isActive: true,
    }).select("name email role").populate("role");
    
    // Filter users who are not managers/admins (basic sales staff)
    const salesStaff = execs.filter(u => {
      const roleName = u.role?.name?.toLowerCase() || "";
      return !roleName.includes("manager") && !roleName.includes("admin");
    });

    team = await Promise.all(
      salesStaff.map(async (u) => {
        const assignedTo = u._id;
        const [leads, deals, won, activities, overdue] = await Promise.all([
          Lead.countDocuments({ assignedTo }),
          Deal.countDocuments({ assignedTo, stage: { $nin: ["won", "lost"] } }),
          Deal.aggregate([
            { $match: { assignedTo, stage: "won" } },
            { $group: { _id: null, value: { $sum: "$value" } } },
          ]),
          Activity.countDocuments({ assignedTo }),
          Activity.countDocuments({ assignedTo, status: "overdue" }),
        ]);
        return {
          user: u,
          leads,
          openDeals: deals,
          wonRevenue: won[0]?.value || 0,
          activities,
          overdue,
        };
      })
    );
  }

  res.json({
    leads: {
      total: totalLeads,
      new: newLeads,
      qualified: qualifiedLeads,
      converted: convertedLeads,
      lost: lostLeads,
      conversionRate,
    },
    customers: { total: totalCustomers, newlyConverted: newCustomers },
    deals: {
      total: totalDeals,
      open: openDeals,
      won: wonDeals,
      lost: lostDeals,
      pipelineValue: pipelineAgg[0]?.value || 0,
      wonRevenue: wonAgg[0]?.value || 0,
      expectedRevenue: expectedAgg[0]?.value || 0,
      byStage: pipelineByStage,
    },
    activities: {
      pending: pendingActivities,
      completed: completedActivities,
      overdue: overdueActivities,
    },
    team,
  });
});

export { getDashboard };
