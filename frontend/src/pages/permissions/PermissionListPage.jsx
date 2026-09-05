import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListPermissionsQuery, useDeletePermissionMutation } from "../../app/api.js";
import { useDispatch } from "react-redux";
import { showToast } from "../../features/ui/uiSlice.js";

export default function PermissionListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [action, setAction] = useState("");
  const [isActive, setIsActive] = useState("");
  const { data, isLoading, error } = useListPermissionsQuery({ search, category, action, isActive });
  const [deletePermission] = useDeletePermissionMutation();

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete permission "${name}"?`)) return;
    try {
      await deletePermission(id).unwrap();
      dispatch(showToast("Permission deleted successfully"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Failed to delete permission"));
    }
  };

  if (isLoading) return <div className="loading">Loading permissions...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const permissions = data?.items || [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1>Permissions</h1>
        <p className="sub">Manage system permissions</p>
      </div>

      <div className="filters">
        <input
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="user">User</option>
          <option value="lead">Lead</option>
          <option value="customer">Customer</option>
          <option value="deal">Deal</option>
          <option value="activity">Activity</option>
          <option value="dashboard">Dashboard</option>
          <option value="settings">Settings</option>
        </select>
        <select value={action} onChange={(e) => setAction(e.target.value)}>
          <option value="">All Actions</option>
          <option value="view">View</option>
          <option value="add">Add</option>
          <option value="edit">Edit</option>
          <option value="delete">Delete</option>
          <option value="list">List</option>
          <option value="export">Export</option>
          <option value="import">Import</option>
        </select>
        <select value={isActive} onChange={(e) => setIsActive(e.target.value)}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button className="btn" onClick={() => navigate("/permissions/add")}>
          Add Permission
        </button>
      </div>

      {permissions.length === 0 ? (
        <div className="empty">No permissions found</div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Display Name</th>
                <th>Category</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Status</th>
                <th>System</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((perm) => (
                <tr key={perm._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{perm.name}</td>
                  <td>{perm.displayName}</td>
                  <td style={{ textTransform: 'capitalize' }}>{perm.category}</td>
                  <td style={{ textTransform: 'capitalize' }}>{perm.action}</td>
                  <td>{perm.resource}</td>
                  <td>
                    <span className={`badge ${perm.isActive ? 'active' : 'lost'}`}>
                      {perm.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {perm.isSystem && <span className="badge">System</span>}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn secondary"
                        onClick={() => navigate(`/permissions/${perm._id}`)}
                      >
                        View
                      </button>
                      {!perm.isSystem && (
                        <>
                          <button
                            className="btn secondary"
                            onClick={() => navigate(`/permissions/${perm._id}/edit`)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn danger"
                            onClick={() => handleDelete(perm._id, perm.displayName)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
