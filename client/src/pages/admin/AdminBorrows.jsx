import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAllBorrowRecords } from "../../api/index.js";

export default function AdminBorrows() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const { data } = await getAllBorrowRecords();
        setRecords(data.records);
      } catch {
        toast.error("Failed to load records");
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const filtered = filter === "all" ? records : records.filter((r) => r.status === filter);

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title">All Borrow Records</h1>
        <p className="section-sub">{records.length} total records</p>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {["all", "borrowed", "returned", "overdue"].map((s) => (
            <button key={s}
              className={`filter-pill ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
              style={{ textTransform: "capitalize" }}>
              {s}
            </button>
          ))}
        </div>

        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div className="empty"><p>No records found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Member</th><th>Book</th><th>Borrowed</th><th>Due Date</th><th>Return Date</th><th>Status</th><th>Fine</th></tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong>{r.userId?.name || "—"}</strong>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-light)" }}>{r.userId?.email}</div>
                    </td>
                    <td>{r.bookId?.title || "—"}</td>
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
