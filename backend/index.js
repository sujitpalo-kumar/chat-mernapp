const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const payment = require("./routes/payment");
const socketHandler = require("./socket");

const app = express();
const server = http.createServer(app);
app.use(cors());
// Socket.IO
const io = new Server(server, {
  cors: { origin: "*" },
});
socketHandler(io);

// Middleware
// app.use(cors());
app.use(express.json());
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists (prevents multer ENOENT errors)
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", payment);
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Basic error handler (catches multer and other errors)
app.use((err, req, res, next) => {
  console.error("Server error:", err && err.stack ? err.stack : err);
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large" });
  }
  res.status(500).json({ message: err.message || "Internal server error" });
});

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

server.listen(process.env.PORT,() => {
  console.log("Backend running on port 5000");
});
