const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

// ✅ IMPORTANT: CORS fix
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow all (easy for now)
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });

  // ✅ Typing indicator
  socket.on("typing", (room) => {
    socket.to(room).emit("show_typing");
  });

  socket.on("stop_typing", (room) => {
    socket.to(room).emit("hide_typing");
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});