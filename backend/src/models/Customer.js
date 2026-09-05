import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

customerSchema.index({ assignedTo: 1, createdAt: -1 });
customerSchema.index({ firstName: "text", lastName: "text", company: "text", email: "text" });

export default mongoose.model("Customer", customerSchema);
