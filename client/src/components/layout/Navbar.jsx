import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { FiMenu, FiX, FiBook, FiUser, FiLogOut } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { logoutUser } from "../../api/index.js";
import "./Navbar.css";

export default function Navbar() {
  const { user, setUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      setUser(null);
      toast.success("Logged out!");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="nav-brand">
          <FiBook size={22} />
          <span>Libraria</span>
        </Link>

        <ul className={`nav-links ${open ? "open" : ""}`}>
          <li><Link to="/" className={isActive("/")} onClick={() => setOpen(false)}>Home</Link></li>
          <li><Link to="/books" className={isActive("/books")} onClick={() => setOpen(false)}>Books</Link></li>
          <li><Link to="/my-borrows" className={isActive("/my-borrows")} onClick={() => setOpen(false)}>My Borrows</Link></li>
          {isAdmin && (
            <>
              <li><Link to="/admin/books" className={isActive("/admin/books")} onClick={() => setOpen(false)}>Manage Books</Link></li>
              <li><Link to="/admin/borrows" className={isActive("/admin/borrows")} onClick={() => setOpen(false)}>All Borrows</Link></li>
              <li><Link to="/admin/users" className={isActive("/admin/users")} onClick={() => setOpen(false)}>Users</Link></li>
            </>
          )}
        </ul>

        <div className="nav-actions">
          <span className="nav-user">
            <FiUser size={15} />
            {user.name.split(" ")[0]}
            {isAdmin && <span className="admin-pill">Admin</span>}
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut size={15} /> <span>Logout</span>
          </button>
          <button className="hamburger" onClick={() => setOpen(!open)}>
            {open ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
