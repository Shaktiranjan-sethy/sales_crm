import express from "express";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import {
  listActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  createValidators,
} from "../controllers/activityController.js";

const router = express.Router();
router.use(protect);

// Activity routes with permission checks
router.get("/", requirePermission("list_activities"), listActivities);
router.post("/", requirePermission("add_activities"), createValidators, createActivity);
router.get("/:id", requirePermission("view_activities"), getActivity);
router.patch("/:id", requirePermission("edit_activities"), updateActivity);
router.delete("/:id", requirePermission("delete_activities"), deleteActivity);

export default router;
