import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetPermissionQuery, useUpdatePermissionMutation, useGetPermissionCategoriesQuery, useGetPermissionActionsQuery } from "../../app/api.js";
import { useDispatch } from "react-redux";
import { showToast } from "../../features/ui/uiSlice.js";

export default function EditPermissionPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { data: permData, isLoading: permLoading } = useGetPermissionQuery(id);
  const [updatePermission, { isLoading, error }] = useUpdatePermissionMutation();
  const { data: categoriesData } = useGetPermissionCategoriesQuery();
  const { data: actionsData } = useGetPermissionActionsQuery();

  const categories = categoriesData?.categories || [];
  const actions = actionsData?.actions || [];

  const [formData, setFormData] = useState({
    displayName: "",
    description: "",
    category: "",
    action: "",
    resource: "",
    isActive: true,
  });

  useEffect(() => {
    if (permData?.permission) {
      const perm = permData.permission;
      setFormData({
        displayName: perm.displayName || "",
        description: perm.description || "",
        category: perm.category || "",
        action: perm.action || "",
        resource: perm.resource || "",
        isActive: perm.isActive !== undefined ? perm.isActive : true,
      });
    }
  }, [permData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePermission({ id, ...formData }).unwrap();
      dispatch(showToast("Permission updated successfully"));
      navigate(`/permissions/${id}`);
    } catch (err) {
      dispatch(showToast(err.data?.message || "Failed to update permission"));
    }
  };

  if (permLoading) return <div className="loading">Loading permission...</div>;

  const permission = permData?.permission;

  if (permission?.isSystem) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <button className="btn secondary" onClick={() => navigate(`/permissions/${id}`)}>
            ← Back to Permission
          </button>
        </div>

        <div className="card" style={{ padding: 24, marginTop: 24, background: '#fffbeb', borderColor: '#fcd34d' }}>
          <h1 style={{ color: '#92400e', marginBottom: 8 }}>System Permission</h1>
          <p style={{ color: '#b45309' }}>This permission cannot be modified as it is a system permission.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button className="btn secondary" onClick={() => navigate(`/permissions/${id}`)}>
          ← Back to Permission
        </button>
      </div>

      <h1>Edit Permission</h1>
      <p className="sub">Modify permission details</p>

      <form className="card" style={{ padding: 24, marginTop: 24 }} onSubmit={handleSubmit}>
        <div className="field">
          <label>Permission Name</label>
          <input
            value={permission?.name || ""}
            disabled
            style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
          />
          <small style={{ color: "var(--muted)" }}>Cannot modify permission name</small>
        </div>

        <div className="field">
          <label>Display Name *</label>
          <input
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
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
            required
          />
        </div>

        <div className="field">
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            Active
          </label>
        </div>

        {error && <div className="alert">{error.data?.message || "Failed to update permission"}</div>}

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Permission"}
          </button>
          <button type="button" className="btn secondary" onClick={() => navigate(`/permissions/${id}`)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
