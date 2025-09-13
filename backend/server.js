// backend/server.js

import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import { initializeMqttListener } from "./services/mqttHandler.js"; // Correct import

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// --- Global Middleware ---
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io; // Attach io instance to requests
  next();
});

// --- API Routes ---
app.use("/auth", authRoutes);
app.use("/api", deviceRoutes);

// 2. Handle Socket.IO client connections
io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.on("join-room", (deviceUid) => {
    if (deviceUid) {
      socket.join(deviceUid);
      console.log(`Client ${socket.id} joined room for device: ${deviceUid}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// --- Server Startup Logic ---
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected Successfully!");

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      
      // 3. Start the MQTT listener and pass it the `io` instance
      initializeMqttListener(io);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed!", error);
    process.exit(1);
  }
};

startServer();

// --- Graceful Shutdown & Error Handling ---
process.on("unhandledRejection", (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});