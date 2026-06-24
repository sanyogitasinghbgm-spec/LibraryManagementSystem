import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPassword } from "../api/index.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>Reset Your <span className="accent">Password</span></h1>
        <p>Enter your registered email and we'll send you a secure link to reset your password.</p>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2>Forgot Password</h2>
          <p><Link to="/login" className="auth-link">← Back to login</Link></p>
          {sent ? (
            <div className="card" style={{ marginTop: "28px", textAlign: "center", background: "#d4edda", boxShadow: "none" }}>
              <p style={{ color: "#1a7a4a", fontWeight: 600 }}>✅ Reset link sent! Check your inbox.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ marginTop: "28px" }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
                type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
