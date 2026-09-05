import express from "express";
import { protect } from "../middleware/auth.js";
import { requireAnyPermission } from "../middleware/permissions.js";
import {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getAvailablePermissions,
  createValidators,
} from "../controllers/roleController.js";

const router = express.Router();
router.use(protect);

router.get("/permissions", requireAnyPermission(["list_roles", "add_roles", "edit_roles", "manage_roles", "add_users", "edit_users"]), getAvailablePermissions);
router.get("/", requireAnyPermission(["list_roles", "manage_roles", "add_users", "edit_users"]), listRoles);
router.get("/:id", requireAnyPermission(["view_roles", "manage_roles"]), getRole);
router.post("/", requireAnyPermission(["add_roles", "manage_roles"]), createValidators, createRole);
router.patch("/:id", requireAnyPermission(["edit_roles", "manage_roles"]), updateRole);
router.delete("/:id", requireAnyPermission(["delete_roles", "manage_roles"]), deleteRole);

export default router;
