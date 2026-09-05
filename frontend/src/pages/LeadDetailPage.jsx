import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useAssigneesQuery,
  useConvertLeadMutation,
  useCreateActivityMutation,
  useGetLeadQuery,
  useGetTimelineQuery,
  useUpdateLeadMutation,
} from "../app/api.js";
import { ErrorBox, Status, formatDate } from "../components/ui.jsx";
import { showToast } from "../features/ui/uiSlice.js";
import { useAuth } from "../hooks/useAuth.js";
import Can from "../components/Can.jsx";

export default function LeadDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useGetLeadQuery(id);
  const { data: timeline } = useGetTimelineQuery({ entityType: "lead", entityId: id });
  const { data: assignees } = useAssigneesQuery();
  const [updateLead] = useUpdateLeadMutation();
  const [convertLead] = useConvertLeadMutation();
  const [createActivity] = useCreateActivityMutation();
  const [notes, setNotes] = useState("");
  const [deal, setDeal] = useState({ title: "", value: 50000, probability: 20, expectedCloseDate: "" });
  const [follow, setFollow] = useState({ type: "call", title: "", dueAt: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { can } = useAuth();
  const canEdit = can("edit_leads");
  const canAssign = can("assign_leads") || can("view_team_performance");

  if (isLoading) return <div className="loading">Loading lead...</div>;
  if (error) return <ErrorBox error={error} />;
  const lead = data.lead;

  async function patch(body, ok) {
    try {
      await updateLead({ id, ...body }).unwrap();
      dispatch(showToast(ok || "Lead updated"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Update failed"));
    }
  }

  async function convert(e) {
    e.preventDefault();
    if (!window.confirm("Convert this qualified lead into a customer and deal?")) return;
    try {
      const res = await convertLead({ id, ...deal }).unwrap();
      dispatch(showToast("Lead converted"));
      navigate(`/customers/${res.customer._id}`);
    } catch (err) {
      dispatch(showToast(err.data?.message || "Conversion failed"));
    }
  }

  async function addFollow(e) {
    e.preventDefault();
    try {
      await createActivity({
        ...follow,
        entityType: "lead",
        entityId: id,
      }).unwrap();
      dispatch(showToast("Follow-up created"));
      setFollow({ type: "call", title: "", dueAt: "" });
    } catch (err) {
      dispatch(showToast(err.data?.message || "Could not add follow-up"));
    }
  }

  return (
    <div className="grid two-col">
      <div>
        <h1>{lead.firstName} {lead.lastName}</h1>
        <p className="sub">{lead.company} · {lead.email}</p>
        <Can permission="edit_leads"><Link className="btn secondary" to={`/leads/${id}/edit`}>Edit lead</Link></Can>
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <div className="row-actions" style={{ marginBottom: 12 }}>
            <Status value={lead.status} />
            <Status value={lead.priority} />
          </div>
          <p>Source: {lead.source.replaceAll("_", " ")} · Owner: {lead.assignedTo?.name} · Created {formatDate(lead.createdAt)}</p>
          <div className="field">
            <label>Status</label>
            <select disabled={!canEdit || lead.status === "converted"} value={lead.status} onChange={(e) => patch({ status: e.target.value }, "Status updated")}>
              {["new", "contacted", "qualified", "lost"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Priority</label>
            <select disabled={!canEdit || lead.status === "converted"} value={lead.priority} onChange={(e) => patch({ priority: e.target.value }, "Priority updated")}>
              {["low", "medium", "high"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          {canAssign && canEdit && lead.status !== "converted" && (
            <div className="field">
              <label>Reassign</label>
              <select value={lead.assignedTo?._id} onChange={(e) => patch({ assignedTo: e.target.value }, "Lead reassigned")}>
                {(assignees?.items || []).map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          )}
          {canEdit && (
          <div className="field">
            <label>Add note</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button className="btn secondary" onClick={() => patch({ notes: `${lead.notes || ""}\n${notes}`.trim() }, "Note saved")}>Save note</button>
          </div>
          )}
          {lead.notes && <pre style={{ whiteSpace: "pre-wrap" }}>{lead.notes}</pre>}
        </div>

        {can("convert_leads") && lead.status === "qualified" && (
          <form className="card" style={{ padding: 16, marginTop: 16 }} onSubmit={convert}>
            <h3>Convert to customer + deal</h3>
            <div className="field"><label>Deal title</label><input required value={deal.title} onChange={(e) => setDeal({ ...deal, title: e.target.value })} /></div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div className="field"><label>Value</label><input type="number" min="0" required value={deal.value} onChange={(e) => setDeal({ ...deal, value: e.target.value })} /></div>
              <div className="field"><label>Probability %</label><input type="number" min="0" max="100" required value={deal.probability} onChange={(e) => setDeal({ ...deal, probability: e.target.value })} /></div>
            </div>
            <div className="field"><label>Expected close date</label><input type="date" required value={deal.expectedCloseDate} onChange={(e) => setDeal({ ...deal, expectedCloseDate: e.target.value })} /></div>
            <button className="btn">Convert lead</button>
          </form>
        )}
        {lead.convertedToCustomer && (
          <p style={{ marginTop: 12 }}>Already converted. <Link to={`/customers/${lead.convertedToCustomer}`}>Open customer</Link></p>
        )}
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
