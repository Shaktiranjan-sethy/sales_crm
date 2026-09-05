import { AppError } from "./error.js";

function isAdminUser(user) {
  return Boolean(user?.isAdmin);
}

function hasPerm(user, permission) {
  if (isAdminUser(user)) return true;
  return Boolean(user?.permissions?.includes(permission));
}

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (hasPerm(req.user, permission)) return next();
    return next(new AppError("Unauthorized: you do not have permission for this action", 403));
  };
};

export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (isAdminUser(req.user) || permissions.some((perm) => req.user?.permissions?.includes(perm))) {
      return next();
    }
    return next(new AppError("Unauthorized: you do not have permission for this action", 403));
  };
};

export { isAdminUser, hasPerm };
