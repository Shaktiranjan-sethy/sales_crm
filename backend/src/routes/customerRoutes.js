import express from "express";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from "../controllers/customerController.js";

const router = express.Router();
router.use(protect);
router.get("/", requirePermission("list_customers"), listCustomers);
router.post("/", requirePermission("add_customers"), createCustomer);
router.get("/:id", requirePermission("view_customers"), getCustomer);
router.patch("/:id", requirePermission("edit_customers"), updateCustomer);
router.delete("/:id", requirePermission("delete_customers"), deleteCustomer);

export default router;
