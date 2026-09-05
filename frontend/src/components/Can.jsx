import { useAuth } from "../hooks/useAuth.js";

export default function Can({ permission, children }) {
  const { can } = useAuth();
  if (!can(permission)) return null;
  return children;
}
