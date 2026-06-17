import express from "express";
import {
  addBook,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook,
} from "../controllers/book.controller.js";
import { isAuthenticated, isAuthorized } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", isAuthenticated, isAuthorized("Admin"), addBook);
router.get("/all", isAuthenticated, getAllBooks);
router.get("/:id", isAuthenticated, getBook);
router.put("/update/:id", isAuthenticated, isAuthorized("Admin"), updateBook);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteBook);

export default router;
