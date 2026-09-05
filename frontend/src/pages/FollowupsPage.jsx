import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useListFollowupsQuery, useUpdateActivityMutation } from "../app/api.js";
import { Empty, ErrorBox, Pager, Status, formatDate } from "../components/ui.jsx";
import { useDispatch } from "react-redux";
import { showToast } from "../features/ui/uiSlice.js";
import Can from "../components/Can.jsx";

export default function FollowupsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const params = useMemo(() => ({ page, limit: 12, status, type }), [page, status, type]);
  const { data, isLoading, error } = useListFollowupsQuery(params);
  const [updateActivity] = useUpdateActivityMutation();
  const dispatch = useDispatch();

  async function complete(id) {
    try {
      await updateActivity({ id, status: "completed" }).unwrap();
      dispatch(showToast("Follow-up marked complete"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Update failed"));
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Follow-ups</h1>
          <p className="sub">Calls, emails, meetings, and demos to track</p>
        </div>
        <Can permission="add_activities"><Link className="btn" to="/activities/add">New follow-up</Link></Can>
      </div>
      
      <div className="filters">
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="call">Call</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
          <option value="demo">Demo</option>
        </select>
      </div>

      <div className="card">
        {isLoading && <div className="loading">Loading follow-ups...</div>}
        {error && <ErrorBox error={error} />}
        {!data?.items?.length && !isLoading && <Empty text="No follow-ups found." />}
        
        {!!data?.items?.length && (
          <table>
            <thead>
              <tr>
                <th data-label="Title">Title</th>
                <th data-label="Type">Type</th>
                <th data-label="Description">Description</th>
                <th data-label="Status">Status</th>
                <th data-label="Due Date">Due Date</th>
                <th data-label="Assigned To">Assigned To</th>
                <th data-label="Created By">Created By</th>
                <th data-label="Actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((followup) => (
                <tr key={followup._id}>
                  <td data-label="Title"><strong>{followup.title}</strong></td>
                  <td data-label="Type"><Status value={followup.type} /></td>
                  <td data-label="Description">{followup.description || "-"}</td>
                  <td data-label="Status"><Status value={followup.status} /></td>
                  <td data-label="Due Date">{formatDate(followup.dueAt)}</td>
                  <td data-label="Assigned To">{followup.assignedTo?.name || "-"}</td>
                  <td data-label="Created By">{followup.createdBy?.name || "-"}</td>
                  <td data-label="Actions" className="row-actions">
                    <Can permission="edit_activities">
                      <Link className="btn secondary" to={`/activities/${followup._id}/edit`}>Edit</Link>
                      {followup.status !== "completed" && (
                        <button className="btn secondary" onClick={() => complete(followup._id)}>Complete</button>
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
