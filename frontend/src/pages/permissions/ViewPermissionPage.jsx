import { useNavigate, useParams } from "react-router-dom";
import { useGetPermissionQuery } from "../../app/api.js";

export default function ViewPermissionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, isLoading, error } = useGetPermissionQuery(id);

  if (isLoading) return <div className="loading">Loading permission...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const permission = data?.permission;

  if (!permission) return <div className="empty">Permission not found</div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button className="btn secondary" onClick={() => navigate("/permissions")}>
          ← Back to Permissions
        </button>
      </div>

      <h1>Permission Details</h1>
      <p className="sub">View permission information</p>

      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <div className="field">
          <label>Permission Name</label>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '13px', 
            background: '#f8fafc', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)'
          }}>
            {permission.name}
          </div>
        </div>

        <div className="field">
          <label>Display Name</label>
          <div style={{ 
            background: '#f8fafc', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)'
          }}>
            {permission.displayName}
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <div style={{ 
            background: '#f8fafc', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)',
            minHeight: '60px'
          }}>
            {permission.description || "No description"}
          </div>
        </div>

        <div className="field">
          <label>Category</label>
          <div style={{ 
            background: '#f8fafc', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)',
            textTransform: 'capitalize'
          }}>
            {permission.category}
          </div>
        </div>

        <div className="field">
          <label>Action</label>
          <div style={{ 
            background: '#f8fafc', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)',
            textTransform: 'capitalize'
          }}>
            {permission.action}
          </div>
        </div>

        <div className="field">
          <label>Resource</label>
          <div style={{ 
            background: '#f8fafc', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)'
          }}>
            {permission.resource}
          </div>
        </div>

        <div className="field">
          <label>Status</label>
          <div style={{ 
            background: '#f8fafc', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)'
          }}>
            <span className={`badge ${permission.isActive ? 'active' : 'lost'}`}>
              {permission.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="field">
          <label>Type</label>
          <div style={{ 
            background: '#f8fafc', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)'
          }}>
            {permission.isSystem ? (
              <span className="badge">System Permission</span>
            ) : (
              <span className="badge pending">Custom Permission</span>
            )}
          </div>
        </div>

        <div className="field">
          <label>Created At</label>
          <div style={{ 
            background: '#f8fafc', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)'
          }}>
            {new Date(permission.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="field">
          <label>Updated At</label>
          <div style={{ 
            background: '#f8fafc', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius)',
            border: '1px solid var(--line)'
          }}>
            {new Date(permission.updatedAt).toLocaleString()}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          {!permission.isSystem && (
            <button className="btn" onClick={() => navigate(`/permissions/${permission._id}/edit`)}>
              Edit Permission
            </button>
          )}
          <button className="btn secondary" onClick={() => navigate("/permissions")}>
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}
