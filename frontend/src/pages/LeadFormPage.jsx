import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useAssigneesQuery,
  useCreateLeadMutation,
  useGetLeadQuery,
  useUpdateLeadMutation,
} from "../app/api.js";
import { ErrorBox } from "../components/ui.jsx";
import { showToast } from "../features/ui/uiSlice.js";
import { useAuth } from "../hooks/useAuth.js";
import Can from "../components/Can.jsx";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  source: "website",
  priority: "medium",
  assignedTo: "",
  notes: "",
};

export default function LeadFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { can, isAdmin } = useAuth();
  const { data, isLoading, error } = useGetLeadQuery(id, { skip: !isEdit });
  const { data: assignees } = useAssigneesQuery();
  const [createLead, { isLoading: creating }] = useCreateLeadMutation();
  const [updateLead, { isLoading: updating }] = useUpdateLeadMutation();
  const [form, setForm] = useState(emptyForm);
  const canAssign = isAdmin || can("assign_leads");

  useEffect(() => {
    if (data?.lead) {
      const lead = data.lead;
      setForm({
        firstName: lead.firstName || "",
        lastName: lead.lastName || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        source: lead.source || "website",
        priority: lead.priority || "medium",
        assignedTo: lead.assignedTo?._id || lead.assignedTo || "",
        notes: lead.notes || "",
      });
    }
  }, [data]);

  async function submit(e) {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (isEdit) {
        await updateLead({ id, ...payload }).unwrap();
        dispatch(showToast("Lead updated"));
        navigate(`/leads/${id}`);
      } else {
        await createLead(payload).unwrap();
        dispatch(showToast("Lead created"));
        navigate("/leads");
      }
    } catch (err) {
      dispatch(showToast(err.data?.message || "Could not save lead"));
    }
  }

  if (isEdit && isLoading) return <div className="loading">Loading lead...</div>;
  if (isEdit && error) return <ErrorBox error={error} />;

  return (
    <div>
      <button className="btn secondary" type="button" onClick={() => navigate("/leads")}>← Back to leads</button>
      <h1>{isEdit ? "Edit lead" : "Add lead"}</h1>
      <p className="sub">{isEdit ? "Update lead details." : "Capture a new inbound lead."}</p>
      <form className="card" style={{ padding: 24, marginTop: 16 }} onSubmit={submit}>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="field"><label>First name</label><input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
          <div className="field"><label>Last name</label><input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
        </div>
        <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="field"><label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="field">
            <label>Source</label>
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {["website", "referral", "social_media", "email", "phone"].map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Priority</label>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {["low", "medium", "high"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <Can permission="assign_leads">
          <div className="field">
            <label>Assign to</label>
            <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <option value="">Myself / default</option>
              {(assignees?.items || []).map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
        </Can>
        <div className="field"><label>Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        <div className="row-actions">
          <button className="btn" disabled={creating || updating}>{isEdit ? "Save changes" : "Create lead"}</button>
          <button type="button" className="btn secondary" onClick={() => navigate("/leads")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
