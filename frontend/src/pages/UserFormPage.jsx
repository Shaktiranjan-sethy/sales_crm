import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useCreateUserMutation, useListUsersQuery, useUpdateUserMutation, useListRolesQuery } from "../app/api.js";
import { showToast } from "../features/ui/uiSlice.js";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "",
  phone: "",
  department: "",
  designation: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  dateOfBirth: "",
  employeeId: "",
  joinedDate: "",
  skills: "",
  education: "",
  emergencyContact: "",
  emergencyPhone: "",
  isActive: true,
};

export default function UserFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data } = useListUsersQuery({ limit: 200 }, { skip: !isEdit });
  const { data: rolesData } = useListRolesQuery({ limit: 100, isActive: "true" });
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [form, setForm] = useState(emptyForm);
  const editingUser = (data?.items || []).find((u) => String(u.id || u._id) === String(id));

  useEffect(() => {
    if (!editingUser) return;
    setForm({
      name: editingUser.name || "",
      email: editingUser.email || "",
      password: "",
      role: editingUser.role?._id || editingUser.role || "",
      phone: editingUser.phone || "",
      department: editingUser.department || "",
      designation: editingUser.designation || "",
      address: editingUser.address || "",
      city: editingUser.city || "",
      state: editingUser.state || "",
      zipCode: editingUser.zipCode || "",
      dateOfBirth: editingUser.dateOfBirth ? String(editingUser.dateOfBirth).split("T")[0] : "",
      employeeId: editingUser.employeeId || "",
      joinedDate: editingUser.joinedDate ? String(editingUser.joinedDate).split("T")[0] : "",
      skills: (editingUser.skills || []).join(", "),
      education: editingUser.education || "",
      emergencyContact: editingUser.emergencyContact || "",
      emergencyPhone: editingUser.emergencyPhone || "",
      isActive: editingUser.isActive ?? true,
    });
  }, [editingUser]);

  async function submit(e) {
    e.preventDefault();
    try {
      const submitData = {
        ...form,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      // strip empty-string fields so optional backend validators don't choke on them
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "") delete submitData[key];
      });
      if (isEdit && !submitData.password) delete submitData.password;
      if (isEdit) {
        await updateUser({ id, ...submitData }).unwrap();
        dispatch(showToast("User updated"));
      } else {
        await createUser(submitData).unwrap();
        dispatch(showToast("User created"));
      }
      navigate("/users");
    } catch (err) {
      dispatch(showToast(err.data?.message || "Operation failed"));
    }
  }

  const availableRoles = rolesData?.items || [];

  return (
    <div>
      <button className="btn secondary" type="button" onClick={() => navigate("/users")}>← Back to users</button>
      <h1>{isEdit ? "Edit user" : "Add user"}</h1>
      <form className="card" style={{ padding: 20, marginTop: 16 }} onSubmit={submit}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <div className="field">
            <label>Full Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email *</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Password {!isEdit && "*"}</label>
            <input type="password" minLength={6} required={!isEdit} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label>Role *</label>
            <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="">Select a role</option>
              {availableRoles.map((role) => <option key={role._id} value={role._id}>{role.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Department</label>
            <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div className="field">
            <label>Designation</label>
            <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </div>
          <div className="field">
            <label>Employee ID</label>
            <input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
          </div>
          <div className="field">
            <label>Date of Birth</label>
            <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </div>
          <div className="field">
            <label>Joined Date</label>
            <input type="date" value={form.joinedDate} onChange={(e) => setForm({ ...form, joinedDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="field">
            <label>City</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="field">
            <label>State</label>
            <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div className="field">
            <label>Zip Code</label>
            <input value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
          </div>
          <div className="field">
            <label>Skills (comma separated)</label>
            <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. React, Node, MongoDB" />
          </div>
          <div className="field">
            <label>Education</label>
            <input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
          </div>
          <div className="field">
            <label>Emergency Contact</label>
            <input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
          </div>
          <div className="field">
            <label>Emergency Phone</label>
            <input value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} />
          </div>
          {isEdit && (
            <div className="field">
              <label>Active</label>
              <select value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}
        </div>
        <div className="row-actions" style={{ marginTop: 16 }}>
          <button type="submit" className="btn">{isEdit ? "Update user" : "Create user"}</button>
          <button type="button" className="btn secondary" onClick={() => navigate("/users")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}