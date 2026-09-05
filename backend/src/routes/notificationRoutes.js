import express from "express";
import { protect } from "../middleware/auth.js";
import {
  listNotifications,
  markRead,
  markOneRead,
} from "../controllers/notificationController.js";

const router = express.Router();
router.use(protect);
router.get("/", listNotifications);
router.patch("/read-all", markRead);
router.patch("/:id/read", markOneRead);

export default router;
