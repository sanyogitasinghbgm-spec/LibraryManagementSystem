import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiUserPlus, FiTrash2, FiX } from "react-icons/fi";
import { getAllUsers, addNewAdmin, deleteUser } from "../../api/index.js";

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting]     = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await getAllUsers();
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addNewAdmin(form);
      toast.success("New admin added!");
      setShowModal(false);
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setDeleting(id);
    try {
      await deleteUser(id);
      toast.success("User deleted");
      fetchUsers();
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
            <h1 className="section-title">Users</h1>
            <p className="section-sub">{users.length} registered members</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiUserPlus size={16} /> Add Admin
          </button>
        </div>

        {loading ? <div className="spinner" /> : users.length === 0 ? (
          <div className="empty"><p>No users found.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Verified</th><th>Joined</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td><span className={`badge ${u.isVerified ? "badge-green" : "badge-red"}`}>{u.isVerified ? "Yes" : "No"}</span></td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)} disabled={deleting === u._id}>
                        <FiTrash2 size={13} /> {deleting === u._id ? "..." : "Delete"}
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
                <h3>Add New Admin</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}><FiX size={20} /></button>
              </div>
              <form onSubmit={handleAddAdmin}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
                </div>
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Admin"}
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
