export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    err.message = `${field} already exists`;
    err.statusCode = 400;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    err.message = `Invalid ID format`;
    err.statusCode = 400;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    err.message = "Invalid token. Please login again.";
    err.statusCode = 401;
  }

  if (err.name === "TokenExpiredError") {
    err.message = "Token expired. Please login again.";
    err.statusCode = 401;
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
