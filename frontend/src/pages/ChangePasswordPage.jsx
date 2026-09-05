import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChangePasswordMutation } from "../app/api.js";
import { useDispatch } from "react-redux";
import { showToast } from "../features/ui/uiSlice.js";

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [changePassword, { isLoading, error }] = useChangePasswordMutation();
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }).unwrap();
      
      dispatch(showToast("Password changed successfully"));
      navigate("/profile");
    } catch (err) {
      dispatch(showToast(err.data?.message || "Failed to change password"));
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <button className="btn secondary" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <h1>Change Password</h1>
      <p className="sub">Update your password to keep your account secure</p>

      <div className="card" style={{ padding: 24, marginTop: 24, maxWidth: 500 }}>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Current Password *</label>
            <input
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
            {errors.currentPassword && (
              <small style={{ color: "var(--danger)" }}>{errors.currentPassword}</small>
            )}
          </div>

          <div className="field">
            <label>New Password *</label>
            <input
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
            {errors.newPassword && (
              <small style={{ color: "var(--danger)" }}>{errors.newPassword}</small>
            )}
            <small style={{ color: "var(--muted)" }}>Password must be at least 6 characters</small>
          </div>

          <div className="field">
            <label>Confirm New Password *</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && (
              <small style={{ color: "var(--danger)" }}>{errors.confirmPassword}</small>
            )}
          </div>

          {error && <div className="alert">{error.data?.message || "Failed to change password"}</div>}

          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Changing..." : "Change Password"}
            </button>
            <button 
              type="button" 
              className="btn secondary" 
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}