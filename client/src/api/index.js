import API from "./axios.js";

// ── AUTH ──
export const registerUser   = (data) => API.post("/auth/register", data);
export const verifyOTP      = (data) => API.post("/auth/otp-verify", data);
export const loginUser      = (data) => API.post("/auth/login", data);
export const logoutUser     = ()     => API.get("/auth/logout");
export const getMe          = ()     => API.get("/auth/me");
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword  = (token, data) => API.put(`/auth/reset-password/${token}`, data);
export const updatePassword = (data) => API.put("/auth/update-password", data);

// ── BOOKS ──
export const getAllBooks = (params) => API.get("/book/all", { params });
export const getBook    = (id)     => API.get(`/book/${id}`);
export const addBook    = (data)   => API.post("/book/add", data);       
export const updateBook = (id, data) => API.put(`/book/update/${id}`, data);
export const deleteBook = (id)     => API.delete(`/book/delete/${id}`);

// ── BORROW ──
export const borrowBook         = (bookId) => API.post(`/borrow/record/${bookId}`);
export const returnBook         = (bookId) => API.put(`/borrow/return/${bookId}`);
export const getMyBorrowRecords = ()       => API.get("/borrow/my");
export const getAllBorrowRecords = ()       => API.get("/borrow/all");

// ── USERS ──
export const getAllUsers  = ()   => API.get("/user/all");
export const addNewAdmin  = (data) => API.post("/user/add/new-admin", data);
export const deleteUser   = (id)   => API.delete(`/user/delete/${id}`);
