import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { useUpdateProfileMutation } from "../app/api.js";
import { useDispatch } from "react-redux";
import { showToast } from "../features/ui/uiSlice.js";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, refetch } = useAuth();
  const dispatch = useDispatch();
  const [updateProfile, { isLoading, error }] = useUpdateProfileMutation();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
      }).unwrap();
      
      // Refetch user data to get updated information
      await refetch();
      
      // Update local storage with new user data
      const storedUser = JSON.parse(localStorage.getItem("crm_user") || "{}");
      const updatedUser = { ...storedUser, name: formData.name, phone: formData.phone };
      localStorage.setItem("crm_user", JSON.stringify(updatedUser));
      
      dispatch(showToast("Profile updated successfully"));
    } catch (err) {
      dispatch(showToast(err.data?.message || "Failed to update profile"));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button className="btn secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <h1>My Profile</h1>
      <p className="sub">View and update your profile information</p>

      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Email *</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
              style={{ background: "#f1f5f9", cursor: "not-allowed" }}
            />
            <small style={{ color: "var(--muted)" }}>Email cannot be changed</small>
          </div>

          <div className="field">
            <label>Phone</label>
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="field">
            <label>Role</label>
            <input
              value={user?.roleName || "No role"}
              disabled
              style={{ background: "#f1f5f9", cursor: "not-allowed" }}
            />
            <small style={{ color: "var(--muted)" }}>Role is assigned by administrator</small>
          </div>

          {error && <div className="alert">{error.data?.message || "Failed to update profile"}</div>}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Profile"}
            </button>
            <button 
              type="button" 
              className="btn secondary" 
              onClick={() => navigate("/change-password")}
            >
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}