import mongoose from "mongoose";

function isAdmin(user) {
  return Boolean(user?.isAdmin);
}

function isManager(user) {
  if (isAdmin(user)) return true;
  const perms = user?.permissions || [];
  return perms.includes("view_team_performance") || perms.includes("assign_leads");
}

function assignedFilter(user) {
  if (isAdmin(user) || isManager(user)) return {};
  return { assignedTo: user.id };
}

function assignedMatch(user) {
  if (isAdmin(user) || isManager(user)) return {};
  return { assignedTo: new mongoose.Types.ObjectId(user.id) };
}

function canAccessRecord(user, assignedTo) {
  if (isAdmin(user) || isManager(user)) return true;
  return String(assignedTo) === String(user.id);
}

export { isAdmin, isManager, assignedFilter, assignedMatch, canAccessRecord };
