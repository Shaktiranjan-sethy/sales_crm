import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAssigneesQuery, useListDealsQuery, useUpdateDealMutation, useDeleteDealMutation } from "../app/api.js";
import { Empty, ErrorBox, Money, Pager, Status } from "../components/ui.jsx";
import { useDispatch } from "react-redux";
import { showToast } from "../features/ui/uiSlice.js";
import Can from "../components/Can.jsx";
import { useAuth } from "../hooks/useAuth.js";

const STAGES = ["qualification", "discovery", "proposal", "negotiation", "won", "lost"];

export default function DealsPage() {
  const [view, setView] = useState("pipeline");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: "", stage: "", assignedTo: "", minAmount: "", maxAmount: "" });
  const [collapsedStages, setCollapsedStages] = useState({});
  const params = useMemo(
    () => (view === "pipeline" ? { limit: 100, ...filters, stage: "" } : { page, limit: 10, ...filters }),
    [view, page, filters]
  );
  const { data, isLoading, error } = useListDealsQuery(params);
  const { data: assignees } = useAssigneesQuery();
  const [updateDeal] = useUpdateDealMutation();
  const [deleteDeal] = useDeleteDealMutation();
  const dispatch = useDispatch();
  const { can } = useAuth();
  const canMove = can("move_deals") || can("edit_deals");
  const canView = can("view_deals");
  const isManager = can("view_team_performance") || can("assign_leads");

  async function move(deal, stage) {
    try {
      await updateDeal({ id: deal._id, stage }).unwrap();
      dispatch(showToast(`Moved to ${stage}`));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Invalid stage change"));
    }
  }

  async function handleDelete(dealId) {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      await deleteDeal(dealId).unwrap();
      dispatch(showToast("Deal deleted successfully"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Failed to delete deal"));
    }
  }

  function toggleStage(stage) {
    setCollapsedStages(prev => ({
      ...prev,
      [stage]: !prev[stage]
    }));
  }

  const grouped = STAGES.map((stage) => ({
    stage,
    items: (data?.items || []).filter((d) => d.stage === stage),
  }));

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>Deals</h1>
          <p className="sub">Pipeline stages are enforced: Qualification → Discovery → Proposal → Negotiation → Won/Lost.</p>
        </div>
        <div className="row-actions">
          <Can permission="add_deals"><Link className="btn" to="/deals/add">New deal</Link></Can>
          <button className="btn secondary" onClick={() => setView("pipeline")}>Pipeline</button>
          <button className="btn secondary" onClick={() => setView("table")}>Table</button>
        </div>
      </div>
      <div className="filters">
        <input placeholder="Search title" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        {view === "table" && (
          <select value={filters.stage} onChange={(e) => setFilters({ ...filters, stage: e.target.value })}>
            <option value="">All stages</option>
            {STAGES.map((s) => <option key={s}>{s}</option>)}
          </select>
        )}
        <input placeholder="Min amount" value={filters.minAmount} onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })} />
        <input placeholder="Max amount" value={filters.maxAmount} onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })} />
        {isManager && (
          <select value={filters.assignedTo} onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}>
            <option value="">All owners</option>
            {(assignees?.items || []).map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
          </select>
        )}
      </div>
      {isLoading && <div className="loading">Loading deals...</div>}
      {error && <ErrorBox error={error} />}
      {view === "pipeline" && (
        <div className="pipeline">
          {grouped.map((col) => (
            <div className={`pipe-col ${collapsedStages[col.stage] ? 'collapsed' : ''}`} key={col.stage}>
              <div className="pipe-col-header" onClick={() => toggleStage(col.stage)}>
                <h4>{col.stage} <span>({col.items.length})</span></h4>
              </div>
              {col.items.map((deal) => (
                <div className="pipe-card" key={deal._id}>
                  {canView ? <Link to={`/deals/${deal._id}`}><b>{deal.title}</b></Link> : <b>{deal.title}</b>}
                  <div><Money value={deal.value} /></div>
                  <div className="sub">{deal.assignedTo?.name}</div>
                  {canMove && deal.stage !== "won" && deal.stage !== "lost" && (
                    <select value={deal.stage} onChange={(e) => move(deal, e.target.value)}>
                      {STAGES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {view === "table" && (
        <div className="card">
          {!data?.items?.length && <Empty text="No deals found." />}
          {!!data?.items?.length && (
            <table>
              <thead>
                <tr><th data-label="Title">Title</th><th data-label="Stage">Stage</th><th data-label="Value">Value</th><th data-label="Expected">Expected</th><th data-label="Owner">Owner</th><th data-label="Actions"></th></tr>
              </thead>
              <tbody>
                {data.items.map((deal) => (
                  <tr key={deal._id}>
                    <td data-label="Title">{canView ? <Link to={`/deals/${deal._id}`}>{deal.title}</Link> : deal.title}</td>
                    <td data-label="Stage"><Status value={deal.stage} /></td>
                    <td data-label="Value"><Money value={deal.value} /></td>
                    <td data-label="Expected"><Money value={deal.expectedRevenue} /></td>
                    <td data-label="Owner">{deal.assignedTo?.name}</td>
                    <td data-label="Actions">
                      <div className="row-actions">
                        <Can permission="edit_deals"><Link className="btn secondary" to={`/deals/${deal._id}/edit`}>Edit</Link></Can>
                        <Can permission="delete_deals"><button className="btn secondary" onClick={() => handleDelete(deal._id)}>Delete</button></Can>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pager pagination={data?.pagination} page={page} setPage={setPage} />
        </div>
      )}
    </div>
  );
}
