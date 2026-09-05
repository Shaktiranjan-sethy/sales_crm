import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { AppError } from "./error.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Not authenticated", 401);
  }
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").populate("role");
    if (!user || !user.isActive) {
      throw new AppError("User is inactive or not found", 401);
    }
    req.user = { 
      id: String(user._id), 
      role: user.role, 
      roleName: user.role?.name,
      isAdmin: Boolean(user.role?.isAdmin),
      permissions: user.role?.permissions || [],
      name: user.name, 
      email: user.email 
    };
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Invalid or expired token", 401);
  }
});

// Updated authorize function to work with dynamic role names or permissions
async function authorize(...args) {
  return async (req, res, next) => {
    try {
      // If first arg is a permission string, check permission
      if (args.length === 1 && typeof args[0] === 'string' && args[0].includes('_')) {
        const permission = args[0];
        if (!req.user.permissions || !req.user.permissions.includes(permission)) {
          return next(new AppError("You do not have permission for this action", 403));
        }
        next();
        return;
      }

      // Otherwise, check role names (for backward compatibility)
      const roleNames = args;
      if (!roleNames.includes(req.user.roleName)) {
        return next(new AppError("You do not have permission for this action", 403));
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

export { protect, authorize };
