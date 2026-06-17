import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiMail, FiLock } from "react-icons/fi";
import { loginUser } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>Welcome to <span className="accent">Libraria</span></h1>
        <p>Manage your reading journey. Borrow books, track dues, and never miss a return date.</p>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2>Sign In</h2>
          <p>Don't have an account? <Link to="/register" className="auth-link">Register</Link></p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label"><FiMail size={12} /> Email</label>
              <input className="form-input" type="email" name="email" placeholder="you@email.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label"><FiLock size={12} /> Password</label>
              <input className="form-input" type="password" name="password" placeholder="••••••••"
                value={form.password} onChange={handleChange} required />
            </div>
            <div style={{ textAlign: "right", marginBottom: "20px" }}>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: "0.85rem" }}>
                Forgot password?
              </Link>
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
              type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
