import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Fiction", "Non-Fiction", "Science", "History", "Technology", "Biography", "Other"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    availability: {
      type: Boolean,
      default: true,
    },
    coverImage: {
      public_id: { type: String },
      url: { type: String },
    },
    description: {
      type: String,
      trim: true,
    },
    publishedYear: {
      type: Number,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);
bookSchema.pre("save", function (next) {
  this.availability = this.quantity > 0;
  next();
});

export const Book = mongoose.model("Book", bookSchema);
