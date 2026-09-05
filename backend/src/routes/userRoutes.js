import express from "express";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import {
  listUsers,
  listAssignees,
  createUser,
  updateUser,
  deleteUser,
  createValidators,
} from "../controllers/userController.js";

const router = express.Router();
router.use(protect);

// Public routes for authenticated users
router.get("/assignees", listAssignees);

// Admin-only routes with permission checks
router.get("/", requirePermission("list_users"), listUsers);
router.post("/", requirePermission("add_users"), createValidators, createUser);
router.patch("/:id", requirePermission("edit_users"), updateUser);
router.delete("/:id", requirePermission("delete_users"), deleteUser);

export default router;
