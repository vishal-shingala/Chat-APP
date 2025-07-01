import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import connectDB from "./lib/db.js";
import userRouter from "./route/userRoute.js";
import messageRouter from "./route/messageRoute.js";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://chat-app-murex-gamma.vercel.app",
  "http://localhost:5173", // for development
];

// Dynamic origin check
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Block the request
    }
  },
  credentials: true, // If you're using cookies
};

//Initialize socket server
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

//Store online users
export const userSocketMap = {}; // userId:socketId

//Socket connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  //emit online users to connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

app.use(express.json({ limit: "4mb" }));
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/status", (req, res) => res.send("Server is live."));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

await connectDB();

if (process.env.NODE_ENV !== "production") {
  server.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
  });
}

export default server;
