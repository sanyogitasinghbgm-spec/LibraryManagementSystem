import express from "express";
import {
  borrowBook,
  returnBook,
  getMyBorrowRecords,
  getAllBorrowRecords,
} from "../controllers/borrow.controller.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/record/:bookId", isAuthenticated, borrowBook);
router.put("/return/:bookId", isAuthenticated, returnBook);
router.get("/my", isAuthenticated, getMyBorrowRecords);
router.get("/all", isAuthenticated, isAuthorized("Admin"), getAllBorrowRecords);

export default router;
