import { body } from "express-validator";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import User from "../models/User.js";
import { AppError } from "../middleware/error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { parseListQuery, listResponse } from "../utils/pagination.js";

const createValidators = [
  body("name").trim().notEmpty().withMessage("Role name is required"),
  body("description").optional().trim(),
  body("permissions").optional().isArray().withMessage("Permissions must be an array"),
];

async function assertValidPermissions(permissionNames = []) {
  if (!Array.isArray(permissionNames)) {
    throw new AppError("Permissions must be an array", 422);
  }
  if (!permissionNames.length) return [];
  const validPermissions = await Permission.find({ name: { $in: permissionNames }, isActive: true });
  const validNames = validPermissions.map((p) => p.name);
  const invalid = permissionNames.filter((p) => !validNames.includes(p));
  if (invalid.length) throw new AppError(`Invalid permissions: ${invalid.join(", ")}`, 400);
  return permissionNames;
}

const listRoles = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parseListQuery(req.query);
  const filter = {};
  if (req.query.isActive === "true" || req.query.isActive === "false") {
    filter.isActive = req.query.isActive === "true";
  }
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, "i") },
      { description: new RegExp(req.query.search, "i") },
    ];
  }
  const [items, total] = await Promise.all([
    Role.find(filter).sort(sort).skip(skip).limit(limit),
    Role.countDocuments(filter),
  ]);
  res.json(listResponse(items, total, page, limit));
});

const getRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new AppError("Role not found", 404);
  res.json({ role });
});

const createRole = asyncHandler(async (req, res) => {
  validate(req);
  const exists = await Role.findOne({ name: req.body.name });
  if (exists) throw new AppError("Role name already exists", 409);
  const permissionNames = await assertValidPermissions(req.body.permissions || []);
  const role = await Role.create({
    name: req.body.name,
    description: req.body.description || "",
    permissions: permissionNames,
    isActive: req.body.isActive !== false,
    isAdmin: Boolean(req.body.isAdmin),
  });
  res.status(201).json({ role });
});

const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new AppError("Role not found", 404);
  const { name, description, permissions, isActive, isAdmin } = req.body;
  if (name) {
    const exists = await Role.findOne({ name, _id: { $ne: role._id } });
    if (exists) throw new AppError("Role name already exists", 409);
    role.name = name;
  }
  if (description !== undefined) role.description = description;
  if (permissions) role.permissions = await assertValidPermissions(permissions);
  if (isActive !== undefined) role.isActive = isActive;
  if (isAdmin !== undefined && !role.isSystemRole) role.isAdmin = Boolean(isAdmin);
  await role.save();
  res.json({ role });
});

const deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) throw new AppError("Role not found", 404);
  if (role.isSystemRole || role.isAdmin) throw new AppError("Cannot delete the admin/system role", 400);
  const usersWithRole = await User.countDocuments({ role: role._id });
  if (usersWithRole > 0) {
    throw new AppError(`Cannot delete role assigned to ${usersWithRole} user(s)`, 400);
  }
  await Role.findByIdAndDelete(role._id);
  res.json({ message: "Role deleted successfully" });
});

const getAvailablePermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.find({ isActive: true }).sort({ category: 1, resource: 1, action: 1 });
  res.json({ permissions });
});

export {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getAvailablePermissions,
  createValidators,
};
