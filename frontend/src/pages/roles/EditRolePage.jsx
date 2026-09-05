import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetRoleQuery, useUpdateRoleMutation, useGetAvailablePermissionsQuery } from "../../app/api.js";
import { ErrorBox } from "../../components/ui.jsx";
import { useDispatch } from "react-redux";
import { showToast } from "../../features/ui/uiSlice.js";
import RolePermissionPicker from "../../components/RolePermissionPicker.jsx";

export default function EditRolePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: roleData, isLoading: roleLoading } = useGetRoleQuery(id);
  const { data: permissionsData } = useGetAvailablePermissionsQuery();
  const [updateRole] = useUpdateRoleMutation();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: [],
    isActive: true,
  });

  useEffect(() => {
    if (roleData?.role) {
      setForm({
        name: roleData.role.name,
        description: roleData.role.description,
        permissions: roleData.role.permissions,
        isActive: roleData.role.isActive,
      });
    }
  }, [roleData]);

  const availablePermissions = permissionsData?.permissions || [];

  async function submit(e) {
    e.preventDefault();
    try {
      const result = await updateRole({ id, ...form }).unwrap();
      console.log("Update result:", result);
      dispatch(showToast("Role updated successfully"));
      navigate("/roles");
    } catch (err) {
      console.error("Update error:", err);
      dispatch(showToast(err.data?.message || "Failed to update role"));
    }
  }

  if (roleLoading) {
    return <div className="loading">Loading role...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button className="btn secondary" onClick={() => navigate("/roles")}>
          ← Back to Roles
        </button>
      </div>

      <h1>Edit Role</h1>
      <p className="sub">Modify role details and permissions</p>

      <form className="card" style={{ padding: 24, marginTop: 24 }} onSubmit={submit}>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div className="field">
            <label>Role Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Sales Lead"
            />
          </div>
          <div className="field">
            <label>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Role description and purpose"
            />
          </div>
        </div>

        <div className="field" style={{ marginBottom: 24 }}>
          <RolePermissionPicker
            permissions={availablePermissions}
            selected={form.permissions}
            onChange={(permissions) => setForm({ ...form, permissions })}
          />
        </div>

        <div className="field" style={{ marginBottom: 24 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active Role
          </label>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button type="submit" className="btn">
            Update Role
          </button>
          <button type="button" className="btn secondary" onClick={() => navigate("/roles")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
