import express from "express";
import { protect } from "../middleware/auth.js";
import { login, me, updateProfile, changePassword, loginValidators, profileValidators, changePasswordValidators } from "../controllers/authController.js";

const router = express.Router();
router.post("/login", loginValidators, login);
router.get("/me", protect, me);
router.patch("/profile", protect, profileValidators, updateProfile);
router.post("/change-password", protect, changePasswordValidators, changePassword);

export default router;
