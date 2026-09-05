import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Role from "./Role.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Role",
      required: true 
    }, // Dynamic role reference
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    // Additional fields
    department: { type: String, trim: true },
    designation: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    dateOfBirth: { type: Date },
    employeeId: { type: String, trim: true },
    profilePicture: { type: String, trim: true },
    joinedDate: { type: Date },
    skills: [{ type: String, trim: true }],
    education: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    emergencyPhone: { type: String, trim: true },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isActive: 1 });

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function matchPassword(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.signToken = function signToken() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

userSchema.methods.toSafeJSON = async function toSafeJSON() {
  await this.populate("role");
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    roleName: this.role?.name,
    isAdmin: Boolean(this.role?.isAdmin),
    permissions: this.role?.permissions || [],
    phone: this.phone,
    isActive: this.isActive,
    department: this.department,
    designation: this.designation,
    address: this.address,
    city: this.city,
    state: this.state,
    zipCode: this.zipCode,
    dateOfBirth: this.dateOfBirth,
    employeeId: this.employeeId,
    profilePicture: this.profilePicture,
    joinedDate: this.joinedDate,
    skills: this.skills,
    education: this.education,
    emergencyContact: this.emergencyContact,
    emergencyPhone: this.emergencyPhone,
    createdAt: this.createdAt,
  };
};

userSchema.methods.getPermissions = async function getPermissions() {
  if (this.role) {
    const role = await Role.findById(this.role);
    return role ? role.permissions : [];
  }
  return [];
};

userSchema.methods.hasPermission = async function hasPermission(permission) {
  const permissions = await this.getPermissions();
  return permissions.includes(permission);
};

export default mongoose.model("User", userSchema);
