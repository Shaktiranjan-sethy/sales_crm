import express from "express";
import { protect } from "../middleware/auth.js";
import { requirePermission, requireAnyPermission } from "../middleware/permissions.js";
import {
  listPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  getCategories,
  getActions,
  createValidators,
} from "../controllers/permissionController.js";

const router = express.Router();
router.use(protect);

router.get("/", requireAnyPermission(["list_permissions", "manage_permissions", "add_roles", "edit_roles"]), listPermissions);
router.get("/categories", requireAnyPermission(["list_permissions", "add_permissions", "edit_permissions", "manage_permissions"]), getCategories);
router.get("/actions", requireAnyPermission(["list_permissions", "add_permissions", "edit_permissions", "manage_permissions"]), getActions);
router.get("/:id", requireAnyPermission(["view_permissions", "manage_permissions"]), getPermission);
router.post("/", requireAnyPermission(["add_permissions", "manage_permissions"]), createValidators, createPermission);
router.patch("/:id", requireAnyPermission(["edit_permissions", "manage_permissions"]), updatePermission);
router.delete("/:id", requireAnyPermission(["delete_permissions", "manage_permissions"]), deletePermission);

export default router;
