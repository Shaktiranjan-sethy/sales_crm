import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAssigneesQuery, useListLeadsQuery, useDeleteLeadMutation } from "../app/api.js";
import { Empty, ErrorBox, Pager, Status, formatDate } from "../components/ui.jsx";
import Can from "../components/Can.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useDispatch } from "react-redux";
import { showToast } from "../features/ui/uiSlice.js";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", source: "", assignedTo: "" });
  const params = useMemo(() => ({ page, limit: 10, ...filters }), [page, filters]);
  const { data, isLoading, error } = useListLeadsQuery(params);
  const { data: assignees } = useAssigneesQuery();
  const [deleteLead] = useDeleteLeadMutation();
  const dispatch = useDispatch();
  const { can } = useAuth();
  const canView = can("view_leads");
  const canAssign = can("assign_leads") || can("view_team_performance");

  async function handleDelete(leadId) {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteLead(leadId).unwrap();
      dispatch(showToast("Lead deleted successfully"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Failed to delete lead"));
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Leads</h1>
          <p className="sub">Capture, assign, qualify and convert inbound demand.</p>
        </div>
        <Can permission="add_leads"><Link className="btn" to="/leads/add">New lead</Link></Can>
      </div>
      <div className="filters">
        <input placeholder="Search name, email, company" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {["new", "contacted", "qualified", "converted", "lost"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All priorities</option>
          {["low", "medium", "high"].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.source} onChange={(e) => setFilters({ ...filters, source: e.target.value })}>
          <option value="">All sources</option>
          {["website", "referral", "social_media", "email", "phone"].map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
        </select>
        {canAssign && (
          <select value={filters.assignedTo} onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}>
            <option value="">All owners</option>
            {(assignees?.items || []).map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        )}
      </div>
      <div className="card">
        {isLoading && <div className="loading">Loading leads...</div>}
        {error && <ErrorBox error={error} />}
        {!isLoading && !data?.items?.length && <Empty text="No leads match these filters." />}
        {!!data?.items?.length && (
          <table>
            <thead>
              <tr>
                <th data-label="Name">Name</th>
                <th data-label="Company">Company</th>
                <th data-label="Source">Source</th>
                <th data-label="Status">Status</th>
                <th data-label="Priority">Priority</th>
                <th data-label="Owner">Owner</th>
                <th data-label="Created">Created</th>
                <th data-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((lead) => (
                <tr key={lead._id}>
                  <td data-label="Name">
                    {canView ? <Link to={`/leads/${lead._id}`}>{lead.firstName} {lead.lastName}</Link> : `${lead.firstName} ${lead.lastName}`}
                  </td>
                  <td data-label="Company">{lead.company || "—"}</td>
                  <td data-label="Source">{lead.source.replaceAll("_", " ")}</td>
                  <td data-label="Status"><Status value={lead.status} /></td>
                  <td data-label="Priority"><Status value={lead.priority} /></td>
                  <td data-label="Owner">{lead.assignedTo?.name}</td>
                  <td data-label="Created">{formatDate(lead.createdAt)}</td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <Can permission="edit_leads"><Link className="btn secondary" to={`/leads/${lead._id}/edit`}>Edit</Link></Can>
                      <Can permission="delete_leads"><button className="btn secondary" onClick={() => handleDelete(lead._id)}>Delete</button></Can>
                    </div>
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
