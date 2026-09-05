import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, default: "" },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
    isSystemRole: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);
