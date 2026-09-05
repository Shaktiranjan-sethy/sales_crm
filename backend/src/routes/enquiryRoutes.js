import express from "express";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { listEnquiries } from "../controllers/enquiryController.js";

const router = express.Router();
router.use(protect);
router.get("/", requirePermission("list_leads"), listEnquiries);

export default router;
