import mongoose from "mongoose";
import { DEAL_STAGES } from "../utils/constants.js";

const dealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 0 },
    probability: { type: Number, required: true, min: 0, max: 100 },
    expectedRevenue: { type: Number, required: true, min: 0 },
    stage: { type: String, enum: DEAL_STAGES, default: "qualification" },
    expectedCloseDate: { type: Date, required: true },
    closedAt: { type: Date },
    closeReason: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

dealSchema.index({ assignedTo: 1, stage: 1, createdAt: -1 });
dealSchema.index({ expectedCloseDate: 1 });
dealSchema.index({ value: 1 });
dealSchema.index({ title: "text" });

dealSchema.pre("validate", function setExpectedRevenue(next) {
  this.expectedRevenue = Number(((this.value || 0) * (this.probability || 0)) / 100);
  next();
});

export default mongoose.model("Deal", dealSchema);
