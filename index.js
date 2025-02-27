import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import { Server } from "socket.io";

dotenv.config();
const app = express();
const corsOptions = { origin: "*" };
app.use(
  cors({
    origin: "https://whatsapp-clone-app-client.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/auth/", AuthRoutes);
app.use("/api/messages", MessageRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello World",
  });
});

const server = app.listen(process.env.PORT, () => {
  console.log(`server listening on port ${process.env.PORT}`);
});

// socket server

const io = new Server(server, {
  cors: {
    origin: "https://whatsapp-clone-app-client.vercel.app",
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
