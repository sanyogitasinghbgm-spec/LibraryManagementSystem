import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";

// ── Check if user is logged in ──
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  if (!req.user) {
    return next(new ErrorHandler("User not found", 404));
  }
  next();
});

// ── Check role ──
export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role "${req.user.role}" is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
