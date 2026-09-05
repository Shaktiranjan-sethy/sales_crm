import { body } from "express-validator";
import Permission from "../models/Permission.js";
import Role from "../models/Role.js";
import { AppError } from "../middleware/error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { parseListQuery, listResponse } from "../utils/pagination.js";

const ACTIONS = ["list", "view", "add", "edit", "delete", "export", "import", "manage"];

const createValidators = [
  body("displayName").optional().trim(),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("action").isIn(ACTIONS).withMessage("Invalid action"),
  body("resource").trim().notEmpty().withMessage("Resource is required"),
];

function slug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

const listPermissions = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parseListQuery({ ...req.query, limit: req.query.limit || 200 });
  const filter = {};
  if (req.query.isActive === "true" || req.query.isActive === "false") {
    filter.isActive = req.query.isActive === "true";
  }
  if (req.query.category) filter.category = req.query.category;
  if (req.query.action) filter.action = req.query.action;
  if (req.query.search) {
    const rx = new RegExp(req.query.search, "i");
    filter.$or = [{ name: rx }, { displayName: rx }, { description: rx }, { resource: rx }];
  }
  const [items, total] = await Promise.all([
    Permission.find(filter).sort(sort.createdAt ? sort : { category: 1, resource: 1, action: 1 }).skip(skip).limit(limit),
    Permission.countDocuments(filter),
  ]);
  res.json(listResponse(items, total, page, limit));
});

const getPermission = asyncHandler(async (req, res) => {
  const permission = await Permission.findById(req.params.id);
  if (!permission) throw new AppError("Permission not found", 404);
  res.json({ permission });
});

const createPermission = asyncHandler(async (req, res) => {
  validate(req);
  const category = slug(req.body.category);
  const resource = slug(req.body.resource);
  const action = slug(req.body.action);
  const name = slug(req.body.name) || `${action}_${resource}`;
  const exists = await Permission.findOne({ name });
  if (exists) throw new AppError("Permission already exists", 409);

  const permission = await Permission.create({
    name,
    displayName: req.body.displayName || `${action} ${resource}`.replaceAll("_", " "),
    description: req.body.description || "",
    category,
    action,
    resource,
    isActive: true,
    isSystem: false,
  });
  await Role.updateMany({ isAdmin: true }, { $addToSet: { permissions: name } });
  res.status(201).json({ permission });
});

const updatePermission = asyncHandler(async (req, res) => {
  const permission = await Permission.findById(req.params.id);
  if (!permission) throw new AppError("Permission not found", 404);

  const { displayName, description, category, action, resource, isActive } = req.body;
  if (displayName) permission.displayName = displayName;
  if (description !== undefined) permission.description = description;
  if (category) permission.category = slug(category);
  if (action) permission.action = slug(action);
  if (resource) permission.resource = slug(resource);
  if (isActive !== undefined) permission.isActive = isActive;
  await permission.save();
  res.json({ permission });
});

const deletePermission = asyncHandler(async (req, res) => {
  const permission = await Permission.findById(req.params.id);
  if (!permission) throw new AppError("Permission not found", 404);
  if (permission.isSystem) throw new AppError("Cannot delete system permissions", 403);
  const rolesWithPermission = await Role.countDocuments({ permissions: permission.name });
  if (rolesWithPermission > 0) {
    throw new AppError(`Cannot delete permission assigned to ${rolesWithPermission} role(s)`, 400);
  }
  await Permission.findByIdAndDelete(permission._id);
  res.json({ message: "Permission deleted successfully" });
});

const getCategories = asyncHandler(async (req, res) => {
  const fromDb = await Permission.distinct("category");
  const defaults = ["user", "lead", "customer", "deal", "activity", "dashboard", "settings"];
  const categories = [...new Set([...defaults, ...fromDb])].sort();
  res.json({ categories });
});

const getActions = asyncHandler(async (req, res) => {
  res.json({ actions: ACTIONS });
});

export {
  listPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  getCategories,
  getActions,
  createValidators,
};
