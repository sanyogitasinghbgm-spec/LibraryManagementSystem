import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiBook, FiUsers, FiActivity, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { getAllBooks, getAllBorrowRecords, getMyBorrowRecords, getAllUsers } from "../api/index.js";
import "./Home.css";

export default function Home() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ books: 0, borrows: 0, users: 0, myActive: 0 });
  const [recentBorrows, setRecentBorrows] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const booksRes = await getAllBooks();
        const books = booksRes.data.count;

        if (isAdmin) {
          const [borrowsRes, usersRes] = await Promise.all([getAllBorrowRecords(), getAllUsers()]);
          setStats({ books, borrows: borrowsRes.data.count, users: usersRes.data.count });
          setRecentBorrows(borrowsRes.data.records.slice(0, 5));
        } else {
          const myRes = await getMyBorrowRecords();
          const active = myRes.data.records.filter((r) => r.status === "borrowed").length;
          setStats({ books, myActive: active });
          setRecentBorrows(myRes.data.records.slice(0, 5));
        }
      } catch {}
    };
    fetchStats();
  }, [isAdmin]);

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div className="home-hero">
          <div>
            <h1 className="section-title">
              Hello, <span style={{ color: "var(--gold)" }}>{user?.name.split(" ")[0]}</span> 👋
            </h1>
            <p className="section-sub">
              {isAdmin ? "Here's your library overview for today." : "What would you like to read today?"}
            </p>
          </div>
          <Link to="/books" className="btn btn-primary">
            Browse Books <FiArrowRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(15,31,61,0.08)" }}>
              <FiBook size={22} color="var(--navy)" />
            </div>
            <div>
              <p className="stat-num">{stats.books}</p>
              <p className="stat-label">Total Books</p>
            </div>
          </div>

          {isAdmin ? (
            <>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "rgba(201,168,76,0.12)" }}>
                  <FiActivity size={22} color="var(--gold)" />
                </div>
                <div>
                  <p className="stat-num">{stats.borrows}</p>
                  <p className="stat-label">Total Borrows</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: "rgba(26,122,74,0.10)" }}>
                  <FiUsers size={22} color="var(--success)" />
                </div>
                <div>
                  <p className="stat-num">{stats.users}</p>
                  <p className="stat-label">Registered Users</p>
                </div>
              </div>
            </>
          ) : (
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "rgba(201,168,76,0.12)" }}>
                <FiActivity size={22} color="var(--gold)" />
              </div>
              <div>
                <p className="stat-num">{stats.myActive}</p>
                <p className="stat-label">Books I'm Reading</p>
              </div>
            </div>
          )}
        </div>

        {/* Recent */}
        <div style={{ marginTop: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 className="section-title" style={{ fontSize: "1.3rem", marginBottom: 0 }}>
              {isAdmin ? "Recent Borrow Activity" : "My Recent Borrows"}
            </h2>
            <Link to={isAdmin ? "/admin/borrows" : "/my-borrows"} className="btn btn-outline btn-sm">
              View All <FiArrowRight size={13} />
            </Link>
          </div>

          {recentBorrows.length === 0 ? (
            <div className="empty"><p>No borrow records yet.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Book</th>
                    {isAdmin && <th>Member</th>}
                    <th>Borrowed</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBorrows.map((r) => (
                    <tr key={r._id}>
                      <td>{r.bookId?.title || "—"}</td>
                      {isAdmin && <td>{r.userId?.name || "—"}</td>}
                      <td>{new Date(r.borrowedDate).toLocaleDateString()}</td>
                      <td>{new Date(r.dueDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${r.status === "returned" ? "badge-green" : r.status === "overdue" ? "badge-red" : "badge-blue"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{r.fine > 0 ? `Rs. ${r.fine}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
