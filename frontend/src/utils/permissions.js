export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("crm_user") || "null");
  } catch {
    return null;
  }
}

export function isAdminUser(user) {
  return Boolean(user?.isAdmin || user?.roleName === "Admin" || user?.role?.isAdmin);
}

function manageFallback(permission) {
  if (!permission || !permission.includes("_")) return null;
  const idx = permission.indexOf("_");
  return `manage_${permission.slice(idx + 1)}`;
}

export function hasPermission(user, permission) {
  if (!permission) return true;
  if (!user) return false;
  if (isAdminUser(user)) return true;
  const perms = user.permissions || [];
  if (perms.includes(permission)) return true;
  const manage = manageFallback(permission);
  return Boolean(manage && perms.includes(manage));
}

export function hasAnyPermission(user, permissions = []) {
  if (!permissions.length) return true;
  return permissions.some((p) => hasPermission(user, p));
}

export function hasAllPermissions(user, permissions = []) {
  if (!permissions.length) return true;
  return permissions.every((p) => hasPermission(user, p));
}

export function permissionName(item) {
  if (!item) return "";
  return typeof item === "string" ? item : item.name;
}
