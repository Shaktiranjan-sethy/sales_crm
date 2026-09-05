import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePermissionMutation, useGetPermissionCategoriesQuery, useGetPermissionActionsQuery } from "../../app/api.js";
import { useDispatch } from "react-redux";
import { showToast } from "../../features/ui/uiSlice.js";

export default function AddPermissionPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    category: "",
    action: "",
    resource: "",
  });
  const [createPermission, { isLoading, error }] = useCreatePermissionMutation();
  const { data: categoriesData } = useGetPermissionCategoriesQuery();
  const { data: actionsData } = useGetPermissionActionsQuery();

  const categories = categoriesData?.categories || [];
  const actions = actionsData?.actions || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPermission(formData).unwrap();
      dispatch(showToast("Permission created successfully"));
      navigate("/permissions");
    } catch (err) {
      dispatch(showToast(err.data?.message || "Failed to create permission"));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button className="btn secondary" onClick={() => navigate("/permissions")}>
          ← Back to Permissions
        </button>
      </div>

      <h1>Add Permission</h1>
      <p className="sub">Create a new system permission</p>

      <form className="card" style={{ padding: 24, marginTop: 24 }} onSubmit={handleSubmit}>
        <div className="field">
          <label>Permission Name *</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., view_leads"
            required
          />
          <small style={{ color: "var(--muted)" }}>Unique identifier (lowercase, underscores)</small>
        </div>

        <div className="field">
          <label>Display Name *</label>
          <input
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="e.g., View Leads"
            required
          />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief description of what this permission allows"
            rows={3}
          />
        </div>

        <div className="field">
          <label>Category *</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Action *</label>
          <select name="action" value={formData.action} onChange={handleChange} required>
            <option value="">Select Action</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act.charAt(0).toUpperCase() + act.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Resource *</label>
          <input
            name="resource"
            value={formData.resource}
            onChange={handleChange}
            placeholder="e.g., leads, customers, deals"
            required
          />
        </div>

        {error && <div className="alert">{error.data?.message || "Failed to create permission"}</div>}

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Permission"}
          </button>
          <button type="button" className="btn secondary" onClick={() => navigate("/permissions")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
