import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";
import { getAllBooks, addBook, deleteBook } from "../../api/index.js";

const EMPTY_FORM = { title: "", author: "", category: "Fiction", quantity: 1, description: "", publishedYear: "", isbn: "" };
const CATEGORIES = ["Fiction", "Non-Fiction", "Science", "History", "Technology", "Biography", "Other"];

export default function AdminBooks() {
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [coverImage, setCoverImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting]     = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await getAllBooks();
      setBooks(data.books);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (coverImage) fd.append("coverImage", coverImage);
      await addBook(fd);
      toast.success("Book added!");
      setShowModal(false);
      setForm(EMPTY_FORM);
      setCoverImage(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    setDeleting(id);
    try {
      await deleteBook(id);
      toast.success("Book deleted");
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px" }}>
          <div>
            <h1 className="section-title">Manage Books</h1>
            <p className="section-sub">{books.length} books in collection</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus size={16} /> Add Book
          </button>
        </div>

        {loading ? <div className="spinner" /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Title</th><th>Author</th><th>Category</th><th>Qty</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b._id}>
                    <td><strong>{b.title}</strong></td>
                    <td>{b.author}</td>
                    <td><span className="badge badge-blue">{b.category}</span></td>
                    <td>{b.quantity}</td>
                    <td><span className={`badge ${b.availability ? "badge-green" : "badge-red"}`}>{b.availability ? "Available" : "Unavailable"}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)} disabled={deleting === b._id}>
                        <FiTrash2 size={13} /> {deleting === b._id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Book</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}><FiX size={20} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-input" name="title" value={form.title} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Author *</label>
                    <input className="form-input" name="author" value={form.author} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-select" name="category" value={form.category} onChange={handleChange}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input className="form-input" type="number" name="quantity" min={1} value={form.quantity} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">ISBN</label>
                    <input className="form-input" name="isbn" value={form.isbn} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Published Year</label>
                    <input className="form-input" type="number" name="publishedYear" value={form.publishedYear} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" name="description" value={form.description} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])}
                    style={{ fontSize: "0.9rem", color: "var(--text-mid)" }} />
                </div>
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
