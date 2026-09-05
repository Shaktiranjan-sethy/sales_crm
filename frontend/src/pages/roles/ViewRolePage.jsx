import { useNavigate, useParams } from "react-router-dom";
import { useGetRoleQuery, useGetAvailablePermissionsQuery } from "../../app/api.js";
import { ErrorBox, Status } from "../../components/ui.jsx";

export default function ViewRolePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: roleData, isLoading: roleLoading } = useGetRoleQuery(id);
  const { data: permissionsData } = useGetAvailablePermissionsQuery();

  if (roleLoading) {
    return <div className="loading">Loading role details...</div>;
  }

  const role = roleData?.role;
  const availablePermissions = permissionsData?.permissions || [];

  // Group permissions by category
  const permissionGroups = {
    "User Management": availablePermissions.filter(p => p.includes("user")),
    "Lead Management": availablePermissions.filter(p => p.includes("lead")),
    "Customer Management": availablePermissions.filter(p => p.includes("customer")),
    "Deal Management": availablePermissions.filter(p => p.includes("deal")),
    "Activity Management": availablePermissions.filter(p => p.includes("activity")),
    "Dashboard & Reports": availablePermissions.filter(p => p.includes("dashboard") || p.includes("report") || p.includes("performance")),
    "Settings": availablePermissions.filter(p => p.includes("role") || p.includes("setting")),
  };

  const getPermissionLabel = (permission) => {
    return permission.replace(/_/g, " ").toUpperCase();
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button className="btn secondary" onClick={() => navigate("/roles")}>
          ← Back to Roles
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1>Role Details</h1>
          <p className="sub">View role information and permissions</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn secondary" onClick={() => navigate(`/roles/${id}/edit`)}>
            Edit Role
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role Name</label>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{role?.name}</div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</label>
            <div style={{ marginTop: 4 }}><Status value={role?.isActive ? "active" : "inactive"} /></div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Permissions</label>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{role?.permissions?.length || 0}</div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Created</label>
            <div style={{ fontSize: 14, marginTop: 4 }}>{role?.createdAt ? new Date(role.createdAt).toLocaleDateString() : "-"}</div>
          </div>
        </div>

        {role?.description && (
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
            <label style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
            <div style={{ fontSize: 14, marginTop: 4 }}>{role.description}</div>
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 18 }}>Permissions</h3>
        
        {Object.entries(permissionGroups).map(([category, permissions]) => {
          const categoryPermissions = permissions.filter(p => role?.permissions?.includes(p));
          
          if (categoryPermissions.length === 0) return null;
          
          return (
            <div key={category} style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "var(--muted)" }}>{category}</h4>
              <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 8 }}>
                {categoryPermissions.map(permission => (
                  <div key={permission} style={{ 
                    padding: 8,
                    background: "#f0fdf4",
                    borderRadius: 6,
                    border: "1px solid #bbf7d0",
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 8
                  }}>
                    <span style={{ color: "#10b981" }}>✓</span>
                    {getPermissionLabel(permission)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {role?.permissions?.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
            No permissions assigned to this role
          </div>
        )}
      </div>
    </div>
  );
}
