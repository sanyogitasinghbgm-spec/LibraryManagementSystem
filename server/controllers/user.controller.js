import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";

// ── GET ALL USERS (Admin) ──
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ role: "User" }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

// ── ADD NEW ADMIN (Admin only) ──
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Please fill all fields", 400));
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new ErrorHandler("Email already registered", 400));
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: "Admin",
    isVerified: true, // Admin doesn't need OTP
  });

  res.status(201).json({
    success: true,
    message: "New admin registered successfully",
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

// ── DELETE USER (Admin) ──
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});
