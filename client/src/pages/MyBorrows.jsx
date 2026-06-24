import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getMyBorrowRecords, returnBook } from "../api/index.js";

export default function MyBorrows() {
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [returning, setReturning] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await getMyBorrowRecords();
      setRecords(data.records);
    } catch {
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchRecords(); }, []);
  const handleReturn = async (bookId) => {
    setReturning(bookId);
    try {
      const { data } = await returnBook(bookId);
      toast.success(data.message + (data.fine ? ` — ${data.fine}` : ""));
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Return failed");
    } finally {
      setReturning(null);
    }
  };
  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">My Borrowed Books</h1>
        <p className="section-sub">Track your active borrows, due dates and fines</p>

        {loading ? <div className="spinner" /> : records.length === 0 ? (
          <div className="empty"><p>You haven't borrowed any books yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Borrowed On</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Fine</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td><strong>{r.bookId?.title || "—"}</strong></td>
                    <td>{r.bookId?.author || "—"}</td>
                    <td>{new Date(r.borrowedDate).toLocaleDateString()}</td>
                    <td style={{ color: r.status === "overdue" ? "var(--danger)" : "inherit", fontWeight: r.status === "overdue" ? 600 : 400 }}>
                      {new Date(r.dueDate).toLocaleDateString()}
                    </td>
                    <td>{r.returnDate ? new Date(r.returnDate).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className={`badge ${r.status === "returned" ? "badge-green" : r.status === "overdue" ? "badge-red" : "badge-blue"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.fine > 0 ? <span style={{ color: "var(--danger)", fontWeight: 600 }}>Rs. {r.fine}</span> : "—"}</td>
                    <td>
                      {r.status === "borrowed" || r.status === "overdue" ? (
                        <button className="btn btn-outline btn-sm"
                          onClick={() => handleReturn(r.bookId?._id)}
                          disabled={returning === r.bookId?._id}>
                          {returning === r.bookId?._id ? "Returning..." : "Return"}
                        </button>
                      ) : (
                        <span style={{ color: "var(--text-light)", fontSize: "0.82rem" }}>Returned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
