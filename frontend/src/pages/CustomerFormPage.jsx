import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  useAssigneesQuery,
  useCreateCustomerMutation,
  useGetCustomerQuery,
  useUpdateCustomerMutation,
} from "../app/api.js";
import { ErrorBox } from "../components/ui.jsx";
import { showToast } from "../features/ui/uiSlice.js";
import { useAuth } from "../hooks/useAuth.js";
import Can from "../components/Can.jsx";

const emptyForm = { firstName: "", lastName: "", email: "", phone: "", company: "", assignedTo: "", notes: "" };

export default function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { can, isAdmin } = useAuth();
  const { data, isLoading, error } = useGetCustomerQuery(id, { skip: !isEdit });
  const { data: assignees } = useAssigneesQuery();
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();
  const [form, setForm] = useState(emptyForm);
  const canAssign = isAdmin || can("assign_leads") || can("view_team_performance");

  useEffect(() => {
    if (data?.customer) {
      const c = data.customer;
      setForm({
        firstName: c.firstName || "",
        lastName: c.lastName || "",
        email: c.email || "",
        phone: c.phone || "",
        company: c.company || "",
        assignedTo: c.assignedTo?._id || c.assignedTo || "",
        notes: c.notes || "",
      });
    }
  }, [data]);

  async function submit(e) {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (isEdit) {
        await updateCustomer({ id, ...payload }).unwrap();
        dispatch(showToast("Customer updated"));
        navigate(`/customers/${id}`);
      } else {
        await createCustomer(payload).unwrap();
        dispatch(showToast("Customer created"));
        navigate("/customers");
      }
    } catch (err) {
      dispatch(showToast(err.data?.message || "Could not save customer"));
    }
  }

  if (isEdit && isLoading) return <div className="loading">Loading customer...</div>;
  if (isEdit && error) return <ErrorBox error={error} />;

  return (
    <div>
      <button className="btn secondary" type="button" onClick={() => navigate("/customers")}>← Back to customers</button>
      <h1>{isEdit ? "Edit customer" : "Add customer"}</h1>
      <form className="card" style={{ padding: 24, marginTop: 16 }} onSubmit={submit}>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="field"><label>First name</label><input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
          <div className="field"><label>Last name</label><input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
        </div>
        <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="field"><label>Company</label><input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
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
          <button className="btn" disabled={creating || updating}>{isEdit ? "Save changes" : "Create customer"}</button>
          <button type="button" className="btn secondary" onClick={() => navigate("/customers")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
