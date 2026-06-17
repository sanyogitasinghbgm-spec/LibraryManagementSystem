import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

import Navbar from "./components/layout/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyOTP from "./pages/VerifyOTP.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Home from "./pages/Home.jsx";
import Books from "./pages/Books.jsx";
import MyBorrows from "./pages/MyBorrows.jsx";
import AdminBooks from "./pages/admin/AdminBooks.jsx";
import AdminBorrows from "./pages/admin/AdminBorrows.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";

// ── Protected Route ──
const Protected = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "Admin") return <Navigate to="/" replace />;
  return children;
};

// ── Public Route (redirect if logged in) ──
const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (user) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* Public */}
      <Route path="/login"           element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register"        element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/verify-otp"      element={<PublicOnly><VerifyOTP /></PublicOnly>} />
      <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
      <Route path="/reset-password/:token" element={<PublicOnly><ResetPassword /></PublicOnly>} />

      {/* Protected */}
      <Route path="/"          element={<Protected><Home /></Protected>} />
      <Route path="/books"     element={<Protected><Books /></Protected>} />
      <Route path="/my-borrows" element={<Protected><MyBorrows /></Protected>} />

      {/* Admin */}
      <Route path="/admin/books"   element={<Protected adminOnly><AdminBooks /></Protected>} />
      <Route path="/admin/borrows" element={<Protected adminOnly><AdminBorrows /></Protected>} />
      <Route path="/admin/users"   element={<Protected adminOnly><AdminUsers /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: "Inter, sans-serif", fontSize: "0.9rem" },
            success: { iconTheme: { primary: "#1a7a4a", secondary: "#fff" } },
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
