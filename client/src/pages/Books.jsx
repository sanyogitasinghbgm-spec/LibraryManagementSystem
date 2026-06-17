import { useEffect, useState } from "react";
import "./Books.css";
import toast from "react-hot-toast";
import { FiSearch, FiFilter } from "react-icons/fi";
import { getAllBooks, borrowBook } from "../api/index.js";
import BookCard from "../components/ui/BookCard.jsx";

const CATEGORIES = ["All", "Fiction", "Non-Fiction", "Science", "History", "Technology", "Biography", "Other"];

export default function Books() {
  const [books, setBooks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [avail, setAvail]       = useState("");
  const [borrowing, setBorrowing] = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)           params.search = search;
      if (category !== "All") params.category = category;
      if (avail)            params.availability = avail;
      const { data } = await getAllBooks(params);
      setBooks(data.books);
    } catch {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, [category, avail]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleBorrow = async (bookId) => {
    setBorrowing(bookId);
    try {
      const { data } = await borrowBook(bookId);
      toast.success(data.message);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Borrow failed");
    } finally {
      setBorrowing(null);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">Browse Books</h1>
        <p className="section-sub">Find and borrow books from our collection</p>

        {/* Filters */}
        <div className="books-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input className="form-input" placeholder="Search by title..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn btn-primary" type="submit"><FiSearch size={16} /></button>
          </form>
          <div className="filter-row">
            <FiFilter size={15} color="var(--text-light)" />
            {CATEGORIES.map((c) => (
              <button key={c}
                className={`filter-pill ${category === c ? "active" : ""}`}
                onClick={() => setCategory(c)}>{c}</button>
            ))}
            <select className="form-select" style={{ width: "auto", padding: "7px 12px" }}
              value={avail} onChange={(e) => setAvail(e.target.value)}>
              <option value="">All</option>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="spinner" />
        ) : books.length === 0 ? (
          <div className="empty"><p>No books found.</p></div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book._id} book={book} onBorrow={handleBorrow} borrowing={borrowing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
