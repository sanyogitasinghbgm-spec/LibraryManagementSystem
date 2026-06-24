import crypto from "crypto";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";

// ── REGISTER ──
export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;  if (!name || !email || !password) {
    return next(new ErrorHandler("Please fill all fields", 400));
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("Email already registered", 400));
  }
  const user = await User.create({ name, email, password });
  const otp = user.generateOTP();
  await user.save();
  await sendEmail({
    email: user.email,
    subject: "Library System — Email Verification OTP",
    message: `
      <h2>Hello ${user.name}!</h2>
      <p>Your OTP for email verification is:</p>
      <h1 style="color:#2E75B6">${otp}</h1>
      <p>This OTP will expire in <strong>10 minutes</strong>.</p>
    `,
  });
  res.status(201).json({
    success: true,
    message: `OTP sent to ${email}. Please verify your account.`,
    userId: user._id,
  });
});

// ── VERIFY OTP ──
export const verifyOTP = catchAsyncErrors(async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new ErrorHandler("Email and OTP are required", 400));
  }
  const user = await User.findOne({
    email,
    verificationCode: otp,
    verificationCodeExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("Invalid or expired OTP", 400));
  }
  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpire = undefined;
  await user.save();
  sendToken(user, 200, res, "Account verified successfully!");
});

// ── LOGIN ──
export const login = catchAsyncErrors(async (req, res, next) => {  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  if (!user.isVerified) {
    return next(new ErrorHandler("Please verify your email first", 403));
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  sendToken(user, 200, res, "Logged in successfully!");
});

// ── LOGOUT ──
export const logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", "", {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// ── GET LOGGED IN USER ──
export const getMe = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

// ── FORGOT PASSWORD ──
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("No user found with this email", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail({
    email: user.email,
    subject: "Library System — Password Reset Request",
    message: `
      <h2>Hello ${user.name}!</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background:#2E75B6;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>This link expires in <strong>15 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
  res.status(200).json({
    success: true,
    message: `Password reset email sent to ${user.email}`,
  });
});

// ── RESET PASSWORD ──
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("Reset token is invalid or has expired", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res, "Password reset successfully!");
});

// ── UPDATE PASSWORD ──
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(req.body.oldPassword);
  if (!isMatch) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }
  user.password = req.body.newPassword;
  await user.save();

 sendToken(user, 200, res, "Password updated successfully!");
});
