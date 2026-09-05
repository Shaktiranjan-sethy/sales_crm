import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListRolesQuery, useDeleteRoleMutation } from "../../app/api.js";
import { ErrorBox, Status, Pager } from "../../components/ui.jsx";
import { useDispatch } from "react-redux";
import { showToast } from "../../features/ui/uiSlice.js";

export default function RoleListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const navigate = useNavigate();
  
  // Convert string filter to boolean for API
  const getApiParams = () => {
    const params = { page, limit: 20, search };
    if (isActiveFilter !== "") {
      params.isActive = isActiveFilter === "true";
    }
    return params;
  };
  
  const apiParams = getApiParams();
  const { data, isLoading, error } = useListRolesQuery(apiParams);
  const [deleteRole] = useDeleteRoleMutation();
  const dispatch = useDispatch();

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this role?")) return;
    try {
      await deleteRole(id).unwrap();
      dispatch(showToast("Role deleted successfully"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Delete failed"));
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1>Roles Management</h1>
          <p className="sub">Manage system roles and their permissions</p>
        </div>
        <button className="btn" onClick={() => navigate("/roles/add")}>
          + Create New Role
        </button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={isActiveFilter} onChange={(e) => setIsActiveFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="card">
        {isLoading && <div className="loading">Loading roles...</div>}
        {error && <ErrorBox error={error} />}
        <table>
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Description</th>
              <th>Permissions</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((role) => (
              <tr key={role._id}>
                <td>
                  <strong>{role.name}</strong>
                </td>
                <td>{role.description || "-"}</td>
                <td>
                  <span className="badge">{role.permissions.length} permissions</span>
                </td>
                <td><Status value={role.isActive ? "active" : "inactive"} /></td>
                <td>{new Date(role.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="row-actions">
                    <button
                      className="btn secondary"
                      onClick={() => navigate(`/roles/${role._id}`)}
                    >
                      View
                    </button>
                    <button
                      className="btn secondary"
                      onClick={() => navigate(`/roles/${role._id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => handleDelete(role._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pager pagination={data?.pagination} page={page} setPage={setPage} />
      </div>
    </div>
  );
}
