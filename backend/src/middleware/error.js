function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message =
    status === 500 ? "Something went wrong. Please try again." : err.message;
  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export { notFound, errorHandler, AppError };
