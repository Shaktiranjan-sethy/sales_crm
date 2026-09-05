import express from "express";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { listDeals, getDeal, createDeal, updateDeal, deleteDeal } from "../controllers/dealController.js";

const router = express.Router();
router.use(protect);
router.get("/", requirePermission("list_deals"), listDeals);
router.post("/", requirePermission("add_deals"), createDeal);
router.get("/:id", requirePermission("view_deals"), getDeal);
router.patch("/:id", requirePermission("edit_deals"), updateDeal);
router.delete("/:id", requirePermission("delete_deals"), deleteDeal);

export default router;
