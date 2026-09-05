import express from "express";
import { protect } from "../middleware/auth.js";
import { getTimeline } from "../controllers/timelineController.js";

const router = express.Router();
router.use(protect);
router.get("/:entityType/:entityId", getTimeline);

export default router;
