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

//Initialize socket server
export const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
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
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/status", (req, res) => res.send("Server is live."));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

await connectDB();

if(process.env.NODE_ENV !== "production"){
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});}
