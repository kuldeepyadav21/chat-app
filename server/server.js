const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Socket setup with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log("Joined room:", room);
  });

  // Send message
  socket.on("send_message", (data) => {
    console.log("Message:", data);

    // ✅ FIX: send to ALL (including sender)
    io.in(data.room).emit("receive_message", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Port setup
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});