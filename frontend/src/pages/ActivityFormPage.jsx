import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useCreateActivityMutation,
  useGetActivityQuery,
  useListCustomersQuery,
  useListDealsQuery,
  useListLeadsQuery,
  useUpdateActivityMutation,
} from "../app/api.js";
import { ErrorBox } from "../components/ui.jsx";
import { showToast } from "../features/ui/uiSlice.js";

const emptyForm = { type: "call", title: "", description: "", dueAt: "", entityType: "lead", entityId: "" };

function toLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ActivityFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, isLoading, error } = useGetActivityQuery(id, { skip: !isEdit });
  const { data: leads } = useListLeadsQuery({ limit: 50 });
  const { data: customers } = useListCustomersQuery({ limit: 50 });
  const { data: deals } = useListDealsQuery({ limit: 50 });
  const [createActivity, { isLoading: creating }] = useCreateActivityMutation();
  const [updateActivity, { isLoading: updating }] = useUpdateActivityMutation();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (data?.activity) {
      const a = data.activity;
      setForm({
        type: a.type || "call",
        title: a.title || "",
        description: a.description || "",
        dueAt: toLocal(a.dueAt),
        entityType: a.entityType || "lead",
        entityId: a.entityId || "",
      });
    }
  }, [data]);

  const related =
    form.entityType === "customer" ? customers?.items || []
      : form.entityType === "deal" ? deals?.items || []
        : leads?.items || [];

  async function submit(e) {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateActivity({ id, ...form }).unwrap();
        dispatch(showToast("Activity updated"));
      } else {
        await createActivity(form).unwrap();
        dispatch(showToast("Activity created"));
      }
      navigate("/activities");
    } catch (err) {
      dispatch(showToast(err.data?.message || "Could not save activity"));
    }
  }

  if (isEdit && isLoading) return <div className="loading">Loading activity...</div>;
  if (isEdit && error) return <ErrorBox error={error} />;

  return (
    <div>
      <button className="btn secondary" type="button" onClick={() => navigate("/activities")}>← Back to activities</button>
      <h1>{isEdit ? "Edit activity" : "Add activity"}</h1>
      <form className="card" style={{ padding: 24, marginTop: 16 }} onSubmit={submit}>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="field">
            <label>Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {["call", "email", "meeting", "demo", "reminder"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field"><label>Due</label><input type="datetime-local" required value={form.dueAt} onChange={(e) => setForm({ ...form, dueAt: e.target.value })} /></div>
        </div>
        <div className="field"><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="field"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        {!isEdit && (
          <>
            <div className="field">
              <label>Related to</label>
              <select value={form.entityType} onChange={(e) => setForm({ ...form, entityType: e.target.value, entityId: "" })}>
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
                <option value="deal">Deal</option>
              </select>
            </div>
            <div className="field">
              <label>Record</label>
              <select required value={form.entityId} onChange={(e) => setForm({ ...form, entityId: e.target.value })}>
                <option value="">Select record</option>
                {related.map((r) => (
                  <option key={r._id} value={r._id}>{r.title || `${r.firstName || ""} ${r.lastName || ""}`.trim() || r._id}</option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className="row-actions">
          <button className="btn" disabled={creating || updating}>{isEdit ? "Save changes" : "Create activity"}</button>
          <button type="button" className="btn secondary" onClick={() => navigate("/activities")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
