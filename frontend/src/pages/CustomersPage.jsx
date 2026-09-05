import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAssigneesQuery, useListCustomersQuery, useDeleteCustomerMutation } from "../app/api.js";
import { Empty, ErrorBox, Pager, formatDate } from "../components/ui.jsx";
import Can from "../components/Can.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { useDispatch } from "react-redux";
import { showToast } from "../features/ui/uiSlice.js";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", assignedTo: "", dealStatus: "" });
  const params = useMemo(() => ({ page, limit: 10, ...filters }), [page, filters]);
  const { data, isLoading, error } = useListCustomersQuery(params);
  const { data: assignees } = useAssigneesQuery();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const dispatch = useDispatch();
  const { can } = useAuth();
  const canView = can("view_customers");
  const canAssign = can("view_team_performance") || can("assign_leads");

  async function handleDelete(customerId) {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    try {
      await deleteCustomer(customerId).unwrap();
      dispatch(showToast("Customer deleted successfully"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Failed to delete customer"));
    }
  }

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Customers</h1>
          <p className="sub">Converted accounts and related deal history.</p>
        </div>
        <Can permission="add_customers"><Link className="btn" to="/customers/add">New customer</Link></Can>
      </div>
      <div className="filters">
        <input placeholder="Search customer" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        {canAssign && (
          <select value={filters.assignedTo} onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}>
            <option value="">All owners</option>
            {(assignees?.items || []).map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        )}
        <select value={filters.dealStatus} onChange={(e) => setFilters({ ...filters, dealStatus: e.target.value })}>
          <option value="">Any related deal stage</option>
          {["qualification", "discovery", "proposal", "negotiation", "won", "lost"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card">
        {isLoading && <div className="loading">Loading customers...</div>}
        {error && <ErrorBox error={error} />}
        {!isLoading && !data?.items?.length && <Empty text="No customers yet." />}
        {!!data?.items?.length && (
          <table>
            <thead>
              <tr><th data-label="Name">Name</th><th data-label="Company">Company</th><th data-label="Owner">Owner</th><th data-label="Created">Created</th><th data-label="Actions"></th></tr>
            </thead>
            <tbody>
              {data.items.map((c) => (
                <tr key={c._id}>
                  <td data-label="Name">{canView ? <Link to={`/customers/${c._id}`}>{c.firstName} {c.lastName}</Link> : `${c.firstName} ${c.lastName}`}</td>
                  <td data-label="Company">{c.company || "—"}</td>
                  <td data-label="Owner">{c.assignedTo?.name}</td>
                  <td data-label="Created">{formatDate(c.createdAt)}</td>
                  <td data-label="Actions">
                    <div className="row-actions">
                      <Can permission="edit_customers"><Link className="btn secondary" to={`/customers/${c._id}/edit`}>Edit</Link></Can>
                      <Can permission="delete_customers"><button className="btn secondary" onClick={() => handleDelete(c._id)}>Delete</button></Can>
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
