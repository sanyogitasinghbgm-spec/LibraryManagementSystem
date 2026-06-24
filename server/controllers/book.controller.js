import { Book } from "../models/Book.js";
import cloudinary from "../config/cloudinary.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncErrors } from "../utils/catchAsyncErrors.js";

// ── ADD BOOK (Admin) ──
export const addBook = catchAsyncErrors(async (req, res, next) => {
  const { title, author, category, quantity, description, publishedYear, isbn } = req.body;
  if (!title || !author || !category || !quantity) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }
  let coverImage = {};
  if (req.files && req.files.coverImage) {
    const file = req.files.coverImage;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return next(new ErrorHandler("Only JPG, PNG, WEBP images are allowed", 400));
    }
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "library/books",
    });
    coverImage = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }
  const book = await Book.create({
    title,
    author,
    category,
    quantity,
    description,
    publishedYear,
    isbn,
    coverImage,
  });
  res.status(201).json({
    success: true,
    message: "Book added successfully",
    book,
  });
});

// ── GET ALL BOOKS ──
export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
  const { category, availability, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (availability !== undefined) filter.availability = availability === "true";
  if (search) filter.title = { $regex: search, $options: "i" };
  const books = await Book.find(filter).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: books.length,
    books,
  });
});

// ── GET SINGLE BOOK ──
export const getBook = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) return next(new ErrorHandler("Book not found", 404));
  res.status(200).json({ success: true, book });
});

// ── UPDATE BOOK (Admin) ──
export const updateBook = catchAsyncErrors(async (req, res, next) => {
  let book = await Book.findById(req.params.id);
  if (!book) return next(new ErrorHandler("Book not found", 404));
  if (req.files && req.files.coverImage) {
    if (book.coverImage?.public_id) {
      await cloudinary.uploader.destroy(book.coverImage.public_id);
    }
    const result = await cloudinary.uploader.upload(req.files.coverImage.tempFilePath, {
      folder: "library/books",
    });
    req.body.coverImage = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }
  book = await Book.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, message: "Book updated", book });
});

// ── DELETE BOOK (Admin) ──
export const deleteBook = catchAsyncErrors(async (req, res, next) => {
  const book = await Book.findById(req.params.id);
  if (!book) return next(new ErrorHandler("Book not found", 404));
  if (book.coverImage?.public_id) {
    await cloudinary.uploader.destroy(book.coverImage.public_id);
  }
  await book.deleteOne();
  res.status(200).json({ success: true, message: "Book deleted successfully" });
});
