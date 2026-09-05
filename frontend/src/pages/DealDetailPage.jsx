import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useAssigneesQuery,
  useCreateActivityMutation,
  useGetDealQuery,
  useGetTimelineQuery,
  useUpdateDealMutation,
} from "../app/api.js";
import { ErrorBox, Money, Status } from "../components/ui.jsx";
import { showToast } from "../features/ui/uiSlice.js";
import { useAuth } from "../hooks/useAuth.js";
import Can from "../components/Can.jsx";

export default function DealDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetDealQuery(id);
  const { data: timeline } = useGetTimelineQuery({ entityType: "deal", entityId: id });
  const { data: assignees } = useAssigneesQuery();
  const [updateDeal] = useUpdateDealMutation();
  const [createActivity] = useCreateActivityMutation();
  const [follow, setFollow] = useState({ type: "meeting", title: "", dueAt: "" });
  const dispatch = useDispatch();
  const { can } = useAuth();
  const canEdit = can("edit_deals") || can("move_deals");
  const canAssign = can("view_team_performance");

  if (isLoading) return <div className="loading">Loading deal...</div>;
  if (error) return <ErrorBox error={error} />;
  const deal = data.deal;
  const closed = deal.stage === "won" || deal.stage === "lost";

  async function patch(body, ok) {
    try {
      await updateDeal({ id, ...body }).unwrap();
      dispatch(showToast(ok || "Deal updated"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Update failed"));
    }
  }

  async function addFollow(e) {
    e.preventDefault();
    try {
      await createActivity({ ...follow, entityType: "deal", entityId: id }).unwrap();
      dispatch(showToast("Follow-up created"));
      setFollow({ type: "meeting", title: "", dueAt: "" });
    } catch (err) {
      dispatch(showToast(err.data?.message || "Could not add follow-up"));
    }
  }

  return (
    <div className="grid two-col">
      <div>
        <h1>{deal.title}</h1>
        <Can permission="edit_deals"><Link className="btn secondary" to={`/deals/${id}/edit`}>Edit deal</Link></Can>
        <p className="sub">
          Customer <Link to={`/customers/${deal.customer?._id}`}>{deal.customer?.firstName} {deal.customer?.lastName}</Link>
          {" "}· Expected revenue <Money value={deal.expectedRevenue} />
        </p>
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <Status value={deal.stage} />
          <p>Value: <Money value={deal.value} /> · Probability {deal.probability}%</p>
          {!closed && canEdit && (
            <>
              <div className="field">
                <label>Stage</label>
                <select value={deal.stage} onChange={(e) => {
                  const stage = e.target.value;
                  if ((stage === "won" || stage === "lost") && !window.confirm(`Mark this deal as ${stage}?`)) return;
                  patch({ stage }, "Stage updated");
                }}>
                  {["qualification", "discovery", "proposal", "negotiation", "won", "lost"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Value</label>
                <input type="number" defaultValue={deal.value} onBlur={(e) => patch({ value: e.target.value }, "Value updated")} />
              </div>
              <div className="field">
                <label>Probability</label>
                <input type="number" defaultValue={deal.probability} onBlur={(e) => patch({ probability: e.target.value }, "Probability updated")} />
              </div>
              {canAssign && (
                <div className="field">
                  <label>Reassign</label>
                  <select value={deal.assignedTo?._id} onChange={(e) => patch({ assignedTo: e.target.value }, "Deal reassigned")}>
                    {(assignees?.items || []).map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              )}
            </>
          )}
          {closed && <p>Closed on {new Date(deal.closedAt).toLocaleString()} · {deal.closeReason}</p>}
        </div>
      </div>
      <div>
        <div className="card" style={{ padding: 16 }}>
          <h3>Follow-up</h3>
          {can("add_activities") ? (
          <form onSubmit={addFollow}>
            <div className="field">
              <label>Type</label>
              <select value={follow.type} onChange={(e) => setFollow({ ...follow, type: e.target.value })}>
                {["call", "email", "meeting", "demo", "reminder"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>Title</label><input required value={follow.title} onChange={(e) => setFollow({ ...follow, title: e.target.value })} /></div>
            <div className="field"><label>Due</label><input type="datetime-local" required value={follow.dueAt} onChange={(e) => setFollow({ ...follow, dueAt: e.target.value })} /></div>
            <button className="btn secondary">Add activity</button>
          </form>
          ) : <p className="sub">You do not have permission to add follow-ups.</p>}
        </div>
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <h3>Timeline</h3>
          <ul className="timeline">
            {(timeline?.events || []).map((ev) => (
              <li key={ev._id}>
                <b>{ev.message}</b>
                <div className="sub">{ev.actor?.name} · {new Date(ev.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
