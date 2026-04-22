const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("./models/Message");

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// ✅ Create Server
const server = http.createServer(app);

// ✅ Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ✅ Socket Logic
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 🔹 Join Room + Load Old Messages
  socket.on("join_room", async (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);

    try {
      const messages = await Message.find({ room });
      socket.emit("load_messages", messages);
    } catch (err) {
      console.log(err);
    }
  });

  // 🔹 Send Message + Save to DB
  socket.on("send_message", async (data) => {
    try {
      const newMessage = new Message(data);
      await newMessage.save();

      io.to(data.room).emit("receive_message", data);
    } catch (err) {
      console.log(err);
    }
  });

  // 🔹 Typing Indicator
  socket.on("typing", (room) => {
    socket.to(room).emit("show_typing");
  });

  socket.on("stop_typing", (room) => {
    socket.to(room).emit("hide_typing");
  });

  // 🔹 Disconnect
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});