import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useAssigneesQuery,
  useCreateDealMutation,
  useGetDealQuery,
  useListCustomersQuery,
  useUpdateDealMutation,
} from "../app/api.js";
import { ErrorBox } from "../components/ui.jsx";
import { showToast } from "../features/ui/uiSlice.js";
import { useAuth } from "../hooks/useAuth.js";
import Can from "../components/Can.jsx";

const emptyForm = { title: "", value: 0, probability: 20, expectedCloseDate: "", customer: "", assignedTo: "", notes: "" };

export default function DealFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { can, isAdmin } = useAuth();
  const { data, isLoading, error } = useGetDealQuery(id, { skip: !isEdit });
  const { data: customers } = useListCustomersQuery({ limit: 100 });
  const { data: assignees } = useAssigneesQuery();
  const [createDeal, { isLoading: creating }] = useCreateDealMutation();
  const [updateDeal, { isLoading: updating }] = useUpdateDealMutation();
  const [form, setForm] = useState(emptyForm);
  const canAssign = isAdmin || can("view_team_performance");

  useEffect(() => {
    if (data?.deal) {
      const d = data.deal;
      setForm({
        title: d.title || "",
        value: d.value || 0,
        probability: d.probability || 20,
        expectedCloseDate: d.expectedCloseDate ? String(d.expectedCloseDate).slice(0, 10) : "",
        customer: d.customer?._id || d.customer || "",
        assignedTo: d.assignedTo?._id || d.assignedTo || "",
        notes: d.notes || "",
      });
    }
  }, [data]);

  async function submit(e) {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (isEdit) {
        await updateDeal({ id, ...payload }).unwrap();
        dispatch(showToast("Deal updated"));
        navigate(`/deals/${id}`);
      } else {
        await createDeal(payload).unwrap();
        dispatch(showToast("Deal created"));
        navigate("/deals");
      }
    } catch (err) {
      dispatch(showToast(err.data?.message || "Could not save deal"));
    }
  }

  if (isEdit && isLoading) return <div className="loading">Loading deal...</div>;
  if (isEdit && error) return <ErrorBox error={error} />;

  return (
    <div>
      <button className="btn secondary" type="button" onClick={() => navigate("/deals")}>← Back to deals</button>
      <h1>{isEdit ? "Edit deal" : "Add deal"}</h1>
      <form className="card" style={{ padding: 24, marginTop: 16 }} onSubmit={submit}>
        <div className="field"><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="field"><label>Value</label><input type="number" min="0" required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} /></div>
          <div className="field"><label>Probability %</label><input type="number" min="0" max="100" required value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} /></div>
        </div>
        <div className="field"><label>Expected close date</label><input type="date" required value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} /></div>
        <div className="field">
          <label>Customer</label>
          <select required value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })}>
            <option value="">Select customer</option>
            {(customers?.items || []).map((c) => (
              <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
            ))}
          </select>
        </div>
        <Can permission="view_team_performance">
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
          <button className="btn" disabled={creating || updating}>{isEdit ? "Save changes" : "Create deal"}</button>
          <button type="button" className="btn secondary" onClick={() => navigate("/deals")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
