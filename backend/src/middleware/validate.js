import { validationResult } from "express-validator";
import { AppError } from "../middleware/error.js";

function validate(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors.array().map((e) => e.msg).join(", ");
    throw new AppError(message, 422);
  }
}

export { validate };
