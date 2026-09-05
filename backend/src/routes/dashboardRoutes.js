import express from "express";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { getDashboard } from "../controllers/dashboardController.js";

const router = express.Router();
router.get("/", protect, requirePermission("view_dashboard"), getDashboard);

export default router;
