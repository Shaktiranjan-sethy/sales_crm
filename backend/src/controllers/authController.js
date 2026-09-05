import User from "../models/User.js";
import { AppError } from "../middleware/error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { body } from "express-validator";

const loginValidators = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const profileValidators = [
  body("name").notEmpty().withMessage("Name is required"),
];

const changePasswordValidators = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const login = asyncHandler(async (req, res) => {
  validate(req);
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select("+password").populate("role");
  if (!user || !(await user.matchPassword(req.body.password))) {
    throw new AppError("Invalid email or password", 401);
  }
  if (!user.isActive) {
    throw new AppError("Account is inactive", 403);
  }
  const token = user.signToken();
  const safeUser = await user.toSafeJSON();
  res.json({ token, user: safeUser });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate("role");
  res.json({ user: await user.toSafeJSON() });
});

const updateProfile = asyncHandler(async (req, res) => {
  validate(req);
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Update allowed fields
  if (req.body.name) user.name = req.body.name;
  if (req.body.phone !== undefined) user.phone = req.body.phone;

  await user.save();
  
  const updatedUser = await User.findById(req.user.id).populate("role");
  res.json({ user: await updatedUser.toSafeJSON() });
});

const changePassword = asyncHandler(async (req, res) => {
  validate(req);
  const user = await User.findById(req.user.id).select("+password");
  
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Verify current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    throw new AppError("Current password is incorrect", 401);
  }

  // Update password
  user.password = req.body.newPassword;
  await user.save();

  res.json({ message: "Password changed successfully" });
});

export { login, me, updateProfile, changePassword, loginValidators, profileValidators, changePasswordValidators };
