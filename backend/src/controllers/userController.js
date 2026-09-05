import { body } from "express-validator";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { AppError } from "../middleware/error.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { parseListQuery, listResponse } from "../utils/pagination.js";

const createValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isMongoId().withMessage("Valid role ID is required"),
  body("phone").optional().trim(),
  body("department").optional().trim(),
  body("designation").optional().trim(),
  body("address").optional().trim(),
  body("city").optional().trim(),
  body("state").optional().trim(),
  body("zipCode").optional().trim(),
  body("dateOfBirth").optional().isISO8601().withMessage("Invalid date format"),
  body("employeeId").optional().trim(),
  body("joinedDate").optional().isISO8601().withMessage("Invalid date format"),
  body("skills").optional().isArray(),
  body("education").optional().trim(),
  body("emergencyContact").optional().trim(),
  body("emergencyPhone").optional().trim(),
];

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parseListQuery(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === "true";
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, "i") },
      { email: new RegExp(req.query.search, "i") },
    ];
  }
  const [items, total] = await Promise.all([
    User.find(filter).populate("role").sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  
  const safeItems = await Promise.all(items.map(async (u) => await u.toSafeJSON()));
  res.json(listResponse(safeItems, total, page, limit));
});

const listAssignees = asyncHandler(async (req, res) => {
  const users = await User.find({
    isActive: true,
  }).populate("role").select("name email role");
  res.json({ items: users });
});

const createUser = asyncHandler(async (req, res) => {
  validate(req);
  const exists = await User.findOne({ email: req.body.email.toLowerCase() });
  if (exists) throw new AppError("Email already in use", 409);
  
  // Validate role
  const role = await Role.findById(req.body.role);
  if (!role) throw new AppError("Role not found", 404);
  if (!role.isActive) throw new AppError("Role is not active", 400);
  
  const user = await User.create(req.body);
  const safeUser = await user.toSafeJSON();
  res.status(201).json({ user: safeUser });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  
  const { 
    name, 
    role,
    phone, 
    isActive, 
    password,
    department,
    designation,
    address,
    city,
    state,
    zipCode,
    dateOfBirth,
    employeeId,
    profilePicture,
    joinedDate,
    skills,
    education,
    emergencyContact,
    emergencyPhone,
  } = req.body;
  
  if (name) user.name = name;
  if (role) {
    const roleDoc = await Role.findById(role);
    if (!roleDoc) throw new AppError("Role not found", 404);
    if (!roleDoc.isActive) throw new AppError("Role is not active", 400);
    user.role = role;
  }
  if (phone !== undefined) user.phone = phone;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.password = password;
  if (department !== undefined) user.department = department;
  if (designation !== undefined) user.designation = designation;
  if (address !== undefined) user.address = address;
  if (city !== undefined) user.city = city;
  if (state !== undefined) user.state = state;
  if (zipCode !== undefined) user.zipCode = zipCode;
  if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
  if (employeeId !== undefined) user.employeeId = employeeId;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;
  if (joinedDate !== undefined) user.joinedDate = joinedDate;
  if (skills !== undefined) user.skills = skills;
  if (education !== undefined) user.education = education;
  if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
  if (emergencyPhone !== undefined) user.emergencyPhone = emergencyPhone;
  
  await user.save();
  const safeUser = await user.toSafeJSON();
  res.json({ user: safeUser });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  if (String(user._id) === req.user.id) {
    throw new AppError("You cannot delete your own account", 400);
  }
  await User.findByIdAndDelete(user._id);
  res.json({ message: "User deleted successfully" });
});

export { listUsers, listAssignees, createUser, updateUser, deleteUser, createValidators };
