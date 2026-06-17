import { BorrowRecord } from "../models/BorrowRecord.js";
import { Book } from "../models/Book.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";

// ── BORROW A BOOK ──
export const borrowBook = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.findById(req.params.bookId);

  if (!book) return next(new ErrorHandler("Book not found", 404));
  if (!book.availability || book.quantity === 0) {
    return next(new ErrorHandler("Book is not available currently", 400));
  }

  // Check if user already borrowed this book and not returned
  const alreadyBorrowed = await BorrowRecord.findOne({
    userId: req.user._id,
    bookId: req.params.bookId,
    status: "borrowed",
  });

  if (alreadyBorrowed) {
    return next(new ErrorHandler("You have already borrowed this book", 400));
  }

  // Due date = 14 days from today
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  const record = await BorrowRecord.create({
    userId: req.user._id,
    bookId: req.params.bookId,
    dueDate,
  });

  // Decrease book quantity
  book.quantity -= 1;
  await book.save();

  res.status(201).json({
    success: true,
    message: "Book borrowed successfully. Due date: " + dueDate.toDateString(),
    record,
  });
});

// ── RETURN A BOOK ──
export const returnBook = catchAsyncErrors(async (req, res, next) => {
  const record = await BorrowRecord.findOne({
    userId: req.user._id,
    bookId: req.params.bookId,
    status: "borrowed",
  });

  if (!record) {
    return next(new ErrorHandler("No active borrow record found for this book", 404));
  }

  record.returnDate = new Date();
  record.status = "returned";
  record.calculateFine();
  await record.save();

  // Increase book quantity back
  const book = await Book.findById(req.params.bookId);
  if (book) {
    book.quantity += 1;
    await book.save();
  }

  res.status(200).json({
    success: true,
    message: "Book returned successfully",
    fine: record.fine > 0 ? `Fine charged: Rs. ${record.fine}` : "No fine",
    record,
  });
});

// ── MY BORROW RECORDS ──
export const getMyBorrowRecords = catchAsyncErrors(async (req, res, next) => {
  const records = await BorrowRecord.find({ userId: req.user._id })
    .populate("bookId", "title author category coverImage")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: records.length,
    records,
  });
});

// ── ALL BORROW RECORDS (Admin) ──
export const getAllBorrowRecords = catchAsyncErrors(async (req, res, next) => {
  const records = await BorrowRecord.find()
    .populate("userId", "name email")
    .populate("bookId", "title author")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: records.length,
    records,
  });
});
