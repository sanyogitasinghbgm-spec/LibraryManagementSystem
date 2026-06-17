import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock } from "react-icons/fi";
import { registerUser } from "../api/index.js";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await registerUser(form);
      toast.success("OTP sent to your email!");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1><span className="accent">Join</span> Libraria</h1>
        <p>Create your account and start exploring thousands of books. Register and verify your email to get started.</p>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2>Create Account</h2>
          <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label"><FiUser size={12} /> Full Name</label>
              <input className="form-input" type="text" name="name" placeholder="Your full name"
                value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label"><FiMail size={12} /> Email</label>
              <input className="form-input" type="email" name="email" placeholder="you@email.com"
                value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label"><FiLock size={12} /> Password</label>
              <input className="form-input" type="password" name="password" placeholder="Min 8 characters"
                value={form.password} onChange={handleChange} required />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "8px" }}
              type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
