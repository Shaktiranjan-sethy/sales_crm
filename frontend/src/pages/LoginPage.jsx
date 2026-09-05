import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../app/api.js";
import { showToast } from "../features/ui/uiSlice.js";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@crm.com");
  const [password, setPassword] = useState("Admin@123");
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      localStorage.setItem("crm_token", res.token);
      localStorage.setItem("crm_user", JSON.stringify(res.user));
      dispatch(showToast("Welcome back"));
      navigate("/");
    } catch {
      /* error banner */
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={onSubmit}>
        <h2>Sales CRM</h2>
        <p className="sub">Sign in to manage leads, customers and deals.</p>
        {error && <div className="alert">{error.data?.message || "Login failed"}</div>}
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="field">
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <button className="btn" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign in"}</button>
        <p className="sub" style={{ marginTop: 16 }}>
          admin@crm.com / Admin@123<br />
          manager@crm.com / Manager@123<br />
          exec1@crm.com / Exec@123
        </p>
      </form>
    </div>
  );
}
