import { Link } from "react-router-dom";

export default function UnauthorizedPage({ permission }) {
  return (
    <div className="unauth-card card">
      <div className="unauth-code">403</div>
      <h1>Unauthorized</h1>
      <p className="sub">
        You do not have permission to open this page
        {permission ? <> (<code>{permission}</code>)</> : null}.
        Ask an admin to update your role.
      </p>
      <Link className="btn" to="/">Back to dashboard</Link>
    </div>
  );
}
