import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import { connectDB } from "./config/db.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/book.routes.js";
import borrowRoutes from "./routes/borrow.routes.js";
import userRoutes from "./routes/user.routes.js";

// Cron Jobs
import "./services/notifyUsers.js";
import "./services/removeUnverifiedAccounts.js";

dotenv.config();

console.log("SERVER:", process.env.CLOUDINARY_API_KEY);

const app = express();

// ── Middleware ──
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// ── Routes ──
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/book", bookRoutes);
app.use("/api/v1/borrow", borrowRoutes);
app.use("/api/v1/user", userRoutes);

// ── Health Check ──
app.get("/", (req, res) => {
  res.json({ message: "Library Management System API is running ✅" });
});

// ── Global Error Handler ──
app.use(errorMiddleware);

// ── Start Server ──
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
