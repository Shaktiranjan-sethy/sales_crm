import Layout from "./Layout.jsx";
import Toast from "./Toast.jsx";
import UnauthorizedPage from "../pages/UnauthorizedPage.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { hasAllPermissions, hasAnyPermission } from "../utils/permissions.js";

export default function PermissionRoute({
  children,
  permission,
  requiredPermissions,
  requireAny = false,
}) {
  const { user, isLoading } = useAuth();
  const needed = permission ? [permission] : requiredPermissions || [];

  if (isLoading && !user) {
    return <div className="loading" style={{ padding: 24 }}>Checking access...</div>;
  }

  const allowed = requireAny
    ? hasAnyPermission(user, needed)
    : hasAllPermissions(user, needed);

  if (!allowed) {
    return (
      <Layout>
        <UnauthorizedPage permission={needed[0]} />
        <Toast />
      </Layout>
    );
  }

  return children;
}
