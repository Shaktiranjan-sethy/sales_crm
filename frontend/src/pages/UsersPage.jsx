import { Link } from "react-router-dom";
import { useListUsersQuery, useUpdateUserMutation, useDeleteUserMutation } from "../app/api.js";
import { ErrorBox, Status } from "../components/ui.jsx";
import { useDispatch } from "react-redux";
import { showToast } from "../features/ui/uiSlice.js";
import Can from "../components/Can.jsx";

export default function UsersPage() {
  const { data, isLoading, error } = useListUsersQuery({ limit: 50 });
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const dispatch = useDispatch();

  async function toggleActive(user) {
    try {
      await updateUser({ id: user.id || user._id, isActive: !user.isActive }).unwrap();
      dispatch(showToast(`User ${user.isActive ? "deactivated" : "activated"}`));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Update failed"));
    }
  }

  async function handleDelete(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(userId).unwrap();
      dispatch(showToast("User deleted successfully"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Failed to delete user"));
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Users Management</h1>
          <p className="sub">Manage staff members and their role assignments</p>
        </div>
        <Can permission="add_users"><Link className="btn" to="/users/add">Add new user</Link></Can>
      </div>
      <div className="card">
        {isLoading && <div className="loading">Loading users...</div>}
        {error && <ErrorBox error={error} />}
        <table>
          <thead>
            <tr>
              <th data-label="Name">Name</th>
              <th data-label="Email">Email</th>
              <th data-label="Role">Role</th>
              <th data-label="Department">Department</th>
              <th data-label="Designation">Designation</th>
              <th data-label="Status">Status</th>
              <th data-label="Actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((u) => (
              <tr key={u.id || u._id}>
                <td data-label="Name">{u.name}</td>
                <td data-label="Email">{u.email}</td>
                <td data-label="Role">
                  <div>{u.role?.name || "No role"}</div>
                  {u.role?.permissions && (
                    <small style={{ color: "var(--muted)" }}>{u.role.permissions.length} permissions</small>
                  )}
                </td>
                <td data-label="Department">{u.department || "-"}</td>
                <td data-label="Designation">{u.designation || "-"}</td>
                <td data-label="Status"><Status value={u.isActive ? "active" : "inactive"} /></td>
                <td data-label="Actions">
                  <div className="row-actions">
                    <Can permission="edit_users">
                      <Link className="btn secondary" to={`/users/${u.id || u._id}/edit`}>Edit</Link>
                      <button className="btn secondary" onClick={() => toggleActive(u)}>
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </Can>
                    <Can permission="delete_users">
                      <button className="btn secondary" onClick={() => handleDelete(u.id || u._id)}>Delete</button>
                    </Can>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
