import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyOTP } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function VerifyOTP() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await verifyOTP({ email, otp });
      setUser(data.user);
      toast.success("Email verified! Welcome 🎉");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <h1>Verify Your <span className="accent">Email</span></h1>
        <p>We've sent a 6-digit OTP to your email. Enter it below to activate your account.</p>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h2>Enter OTP</h2>
          <p>OTP sent to <strong>{email}</strong></p>
          <form onSubmit={handleSubmit} style={{ marginTop: "28px" }}>
            <div className="form-group">
              <label className="form-label">6-Digit OTP</label>
              <input className="form-input" type="text" placeholder="e.g. 123456"
                value={otp} onChange={(e) => setOtp(e.target.value)}
                maxLength={6} required style={{ fontSize: "1.4rem", letterSpacing: "0.3em", textAlign: "center" }} />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
              type="submit" disabled={loading || otp.length < 6}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
