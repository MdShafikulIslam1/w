import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import { Server } from "socket.io";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

//TODO:implement audio or voice message(try to with cloudinary)
// app.use("/uploads/recordings", express.static("uploads/recordings"));

app.use("/api/auth/", AuthRoutes);
app.use("/api/messages", MessageRoutes);

const server = app.listen(process.env.PORT, () => {
  console.log(`server listening on port ${process.env.PORT}`);
});

// socket server

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("sign-out", (id) => {
    onlineUsers.delete(id);
    socket.broadcast.emit("online-users", {
      onlineUsers: Array.from(onlineUsers.keys()),
    });
  });

  socket.on("send-message", (data) => {
    const sendUserSocket = onlineUsers.get(data?.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("received-message", {
        from: data.from,
        message: data?.message,
      });
    }
  });
});
