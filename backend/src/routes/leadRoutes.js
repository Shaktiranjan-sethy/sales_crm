import express from "express";
import { protect } from "../middleware/auth.js";
import { requirePermission, requireAnyPermission } from "../middleware/permissions.js";
import {
  listLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
  createValidators,
} from "../controllers/leadController.js";

const router = express.Router();
router.use(protect);

// Lead routes with permission checks
router.get("/", requirePermission("list_leads"), listLeads);
router.post("/", requirePermission("add_leads"), createValidators, createLead);
router.get("/:id", requirePermission("view_leads"), getLead);
router.patch("/:id", requirePermission("edit_leads"), updateLead);
router.delete("/:id", requirePermission("delete_leads"), deleteLead);
router.post("/:id/convert", requireAnyPermission(["convert_leads", "edit_leads"]), convertLead);

export default router;
