import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import messageRoute from "./routes/messagesRoute.js";
import { Server as socketIO } from "socket.io";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/message", messageRoute);

// Mongoose configuration to handle deprecation warnings
mongoose.set("strictQuery", false); // This line addresses the deprecation warning

// Mongoose connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successful!");
  })
  .catch((err) => console.log(err));

// Starting the server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on Port ${process.env.PORT}`);
});

// Setting up Socket.io for real-time communication
const io = new socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// Store all online users inside this map
global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  // Event listener for adding a user
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  // Event listener for sending a message
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieved", data.message);
    }
  });
});
