import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useListRemindersQuery, useUpdateActivityMutation } from "../app/api.js";
import { Empty, ErrorBox, Pager, Status, formatDate } from "../components/ui.jsx";
import { useDispatch } from "react-redux";
import { showToast } from "../features/ui/uiSlice.js";
import Can from "../components/Can.jsx";

export default function RemindersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const params = useMemo(() => ({ page, limit: 12, status }), [page, status]);
  const { data, isLoading, error } = useListRemindersQuery(params);
  const [updateActivity] = useUpdateActivityMutation();
  const dispatch = useDispatch();

  async function complete(id) {
    try {
      await updateActivity({ id, status: "completed" }).unwrap();
      dispatch(showToast("Reminder marked complete"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Update failed"));
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Reminders</h1>
          <p className="sub">Important reminders and deadlines</p>
        </div>
        <Can permission="add_activities"><Link className="btn" to="/activities/add">New reminder</Link></Can>
      </div>
      
      <div className="filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="card">
        {isLoading && <div className="loading">Loading reminders...</div>}
        {error && <ErrorBox error={error} />}
        {!data?.items?.length && !isLoading && <Empty text="No reminders found." />}
        
        {!!data?.items?.length && (
          <table>
            <thead>
              <tr>
                <th data-label="Title">Title</th>
                <th data-label="Description">Description</th>
                <th data-label="Status">Status</th>
                <th data-label="Due Date">Due Date</th>
                <th data-label="Assigned To">Assigned To</th>
                <th data-label="Created By">Created By</th>
                <th data-label="Actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((reminder) => (
                <tr key={reminder._id}>
                  <td data-label="Title"><strong>{reminder.title}</strong></td>
                  <td data-label="Description">{reminder.description || "-"}</td>
                  <td data-label="Status"><Status value={reminder.status} /></td>
                  <td data-label="Due Date">{formatDate(reminder.dueAt)}</td>
                  <td data-label="Assigned To">{reminder.assignedTo?.name || "-"}</td>
                  <td data-label="Created By">{reminder.createdBy?.name || "-"}</td>
                  <td data-label="Actions" className="row-actions">
                    <Can permission="edit_activities">
                      <Link className="btn secondary" to={`/activities/${reminder._id}/edit`}>Edit</Link>
                      {reminder.status !== "completed" && (
                        <button className="btn secondary" onClick={() => complete(reminder._id)}>Complete</button>
                      )}
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
