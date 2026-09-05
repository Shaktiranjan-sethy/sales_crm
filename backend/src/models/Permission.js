import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, lowercase: true },
    displayName: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: { type: String, required: true, trim: true, lowercase: true },
    action: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["list", "view", "add", "edit", "delete", "export", "import", "manage"],
    },
    resource: { type: String, required: true, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

permissionSchema.index({ name: 1 }, { unique: true });
permissionSchema.index({ category: 1, resource: 1, action: 1 });

permissionSchema.pre("validate", function setName(next) {
  if (!this.name && this.action && this.resource) {
    this.name = `${this.action}_${this.resource}`.toLowerCase();
  }
  if (!this.displayName && this.action && this.resource) {
    const action = this.action.charAt(0).toUpperCase() + this.action.slice(1);
    const resource = this.resource.replaceAll("_", " ");
    this.displayName = `${action} ${resource}`;
  }
  next();
});

export default mongoose.model("Permission", permissionSchema);
