import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useCreateUserMutation, useListUsersQuery, useUpdateUserMutation, useListRolesQuery } from "../app/api.js";
import { showToast } from "../features/ui/uiSlice.js";
import Can from "../components/Can.jsx";

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
    });
  }, [editingUser]);

  async function submit(e) {
    e.preventDefault();
    try {
      const submitData = {
        ...form,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
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
          <div className="field"><label>Full Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Email *</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          <div className="field">
            <label>Password {!isEdit && "*"}</label>
            <input type="password" minLength={6} required={!isEdit} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="field">
            <label>Role *</label>
            <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="">Select a role</option>
              {availableRoles.map((role) => <option key={role._id} value={role._id}>{role.name}</option>)}
            </select>
          </div>
          <div className="field"><label>Department</label><input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} /></div>
          <div className="field"><label>Designation</label><input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
          <div className="field"><label>Employee ID</label><input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></div>
        </div>
        <div className="row-actions" style={{ marginTop: 16 }}>
          <button type="submit" className="btn">{isEdit ? "Update user" : "Create user"}</button>
          <button type="button" className="btn secondary" onClick={() => navigate("/users")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
