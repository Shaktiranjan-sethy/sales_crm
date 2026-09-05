import mongoose from "mongoose";
import { ENTITY_TYPES } from "../utils/constants.js";

const timelineSchema = new mongoose.Schema(
  {
    entityType: { type: String, enum: ENTITY_TYPES, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

timelineSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export default mongoose.model("TimelineEvent", timelineSchema);
