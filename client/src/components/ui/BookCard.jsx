import { useState } from "react";
import { FiBook, FiUser, FiTag } from "react-icons/fi";
import "./BookCard.css";

export default function BookCard({ book, onBorrow, borrowing }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="book-card">
      <div className="book-cover">
        {book.coverImage?.url && !imgError ? (
          <img src={book.coverImage.url} alt={book.title} onError={() => setImgError(true)} />
        ) : (
          <div className="book-cover-placeholder">
            <FiBook size={36} />
          </div>
        )}
        <span className={`book-avail ${book.availability ? "avail" : "unavail"}`}>
          {book.availability ? "Available" : "Unavailable"}
        </span>
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-meta"><FiUser size={12} /> {book.author}</p>
        <p className="book-meta"><FiTag size={12} /> {book.category}</p>
        <div className="book-footer">
          <span className="book-qty">{book.quantity} left</span>
          {onBorrow && (
            <button
              className="btn btn-gold btn-sm"
              onClick={() => onBorrow(book._id)}
              disabled={!book.availability || borrowing === book._id}
            >
              {borrowing === book._id ? "Borrowing..." : "Borrow"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
