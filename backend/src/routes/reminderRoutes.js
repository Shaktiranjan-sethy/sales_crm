import express from "express";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { listReminders } from "../controllers/reminderController.js";

const router = express.Router();
router.use(protect);
router.get("/", requirePermission("list_activities"), listReminders);

export default router;
