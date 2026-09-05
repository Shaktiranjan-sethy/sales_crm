import express from "express";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { listFollowups } from "../controllers/followupController.js";

const router = express.Router();
router.use(protect);
router.get("/", requirePermission("list_activities"), listFollowups);

export default router;
