import mongoose from "mongoose";

const borrowRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    borrowedDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    fine: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["borrowed", "returned", "overdue"],
      default: "borrowed",
    },
  },
  { timestamps: true }
);
borrowRecordSchema.methods.calculateFine = function () {
  if (this.returnDate && this.returnDate > this.dueDate) {
    const diffTime = this.returnDate - this.dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.fine = diffDays * 5;
  }
  return this.fine;
};

export const BorrowRecord = mongoose.model("BorrowRecord", borrowRecordSchema);
