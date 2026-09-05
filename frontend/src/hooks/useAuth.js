import { useEffect } from "react";
import { useMeQuery } from "../app/api.js";
import { getStoredUser, hasPermission, isAdminUser } from "../utils/permissions.js";

export function useAuth() {
  const { data, isLoading, refetch } = useMeQuery();
  const user = data?.user || getStoredUser();
  const isAdmin = isAdminUser(user);
  const can = (permission) => hasPermission(user, permission);

  useEffect(() => {
    if (data?.user) localStorage.setItem("crm_user", JSON.stringify(data.user));
  }, [data]);

  return { user, isAdmin, can, isLoading, refetch };
}
