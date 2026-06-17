import express from "express";
import {
  register,
  verifyOTP,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/otp-verify", verifyOTP);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, getMe);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.put("/update-password", isAuthenticated, updatePassword);

export default router;
