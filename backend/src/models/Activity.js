import mongoose from "mongoose";
import { ACTIVITY_TYPES, ACTIVITY_STATUSES, ENTITY_TYPES } from "../utils/constants.js";

const activitySchema = new mongoose.Schema(
  {
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ACTIVITY_STATUSES, default: "pending" },
    dueAt: { type: Date, required: true },
    completedAt: { type: Date },
    entityType: { type: String, enum: ENTITY_TYPES, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

activitySchema.index({ assignedTo: 1, status: 1, dueAt: 1 });
activitySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export default mongoose.model("Activity", activitySchema);
