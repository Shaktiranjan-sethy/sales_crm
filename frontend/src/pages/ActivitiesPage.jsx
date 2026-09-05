import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useListActivitiesQuery, useUpdateActivityMutation, useDeleteActivityMutation } from "../app/api.js";
import { Empty, ErrorBox, Pager, Status, formatDate } from "../components/ui.jsx";
import { useDispatch } from "react-redux";
import { showToast } from "../features/ui/uiSlice.js";
import Can from "../components/Can.jsx";

export default function ActivitiesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const params = useMemo(() => ({ page, limit: 12, status }), [page, status]);
  const { data, isLoading, error } = useListActivitiesQuery(params);
  const [updateActivity] = useUpdateActivityMutation();
  const [deleteActivity] = useDeleteActivityMutation();
  const dispatch = useDispatch();

  async function complete(id) {
    try {
      await updateActivity({ id, status: "completed" }).unwrap();
      dispatch(showToast("Marked complete"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Update failed"));
    }
  }

  async function handleDelete(activityId) {
    if (!confirm("Are you sure you want to delete this activity?")) return;
    try {
      await deleteActivity(activityId).unwrap();
      dispatch(showToast("Activity deleted successfully"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Failed to delete activity"));
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Activities</h1>
          <p className="sub">Calls, emails, meetings, demos and reminders. Pending items past due become overdue.</p>
        </div>
        <Can permission="add_activities"><Link className="btn" to="/activities/add">New activity</Link></Can>
      </div>
      <div className="filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {["pending", "completed", "overdue"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card">
        {isLoading && <div className="loading">Loading activities...</div>}
        {error && <ErrorBox error={error} />}
        {!data?.items?.length && !isLoading && <Empty text="No activities yet." />}
        {!!data?.items?.length && (
          <table>
            <thead>
              <tr><th data-label="Title">Title</th><th data-label="Type">Type</th><th data-label="Status">Status</th><th data-label="Due">Due</th><th data-label="Owner">Owner</th><th data-label="Actions"></th></tr>
            </thead>
            <tbody>
              {data.items.map((a) => (
                <tr key={a._id}>
                  <td data-label="Title">{a.title}</td>
                  <td data-label="Type">{a.type}</td>
                  <td data-label="Status"><Status value={a.status} /></td>
                  <td data-label="Due">{formatDate(a.dueAt)}</td>
                  <td data-label="Owner">{a.assignedTo?.name}</td>
                  <td data-label="Actions" className="row-actions">
                    <Can permission="edit_activities">
                      <Link className="btn secondary" to={`/activities/${a._id}/edit`}>Edit</Link>
                      {a.status !== "completed" && (
                        <button className="btn secondary" onClick={() => complete(a._id)}>Complete</button>
                      )}
                    </Can>
                    <Can permission="delete_activities">
                      <button className="btn secondary" onClick={() => handleDelete(a._id)}>Delete</button>
                    </Can>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pager pagination={data?.pagination} page={page} setPage={setPage} />
      </div>
    </div>
  );
}
