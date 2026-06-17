import express from "express";
import {
  getAllUsers,
  addNewAdmin,
  deleteUser,
} from "../controllers/user.controller.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/all", isAuthenticated, isAuthorized("Admin"), getAllUsers);
router.post("/add/new-admin", isAuthenticated, isAuthorized("Admin"), addNewAdmin);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteUser);

export default router;
