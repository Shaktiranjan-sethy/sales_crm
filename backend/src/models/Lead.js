import mongoose from "mongoose";
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
} from "../utils/constants.js";

const leadSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    source: { type: String, enum: LEAD_SOURCES, required: true },
    status: { type: String, enum: LEAD_STATUSES, default: "new" },
    priority: { type: String, enum: LEAD_PRIORITIES, default: "medium" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "" },
    convertedToCustomer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    convertedAt: { type: Date },
  },
  { timestamps: true }
);

leadSchema.index({ assignedTo: 1, status: 1, createdAt: -1 });
leadSchema.index({ source: 1, priority: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ firstName: "text", lastName: "text", company: "text", email: "text" });

export default mongoose.model("Lead", leadSchema);
