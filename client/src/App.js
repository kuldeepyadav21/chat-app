import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("https://chat-app-server-qklq.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  // 🔥 FORCE JOIN SCREEN ALWAYS
  useEffect(() => {
    setShowChat(false);
  }, []);

  // ✅ Socket listeners
  useEffect(() => {
    socket.on("load_messages", (data) => {
      setMessageList(data);
    });

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("show_typing", () => {
      setTypingStatus("Someone is typing...");
    });

    socket.on("hide_typing", () => {
      setTypingStatus("");
    });

    return () => {
      socket.off("load_messages");
      socket.off("receive_message");
      socket.off("online_users");
      socket.off("show_typing");
      socket.off("hide_typing");
    };
  }, []);

  // ✅ Join room
  const joinRoom = () => {
    if (username.trim() !== "" && room.trim() !== "") {
      socket.emit("join_room", { room, username });
      setShowChat(true);
    }
  };

  // ✅ Send message
  const sendMessage = async () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString(),
      };

      socket.emit("send_message", messageData);

      setCurrentMessage("");
      socket.emit("stop_typing", room);
    }
  };

  // ✅ Typing handler
  const handleTyping = (e) => {
    setCurrentMessage(e.target.value);

    socket.emit("typing", room);

    setTimeout(() => {
      socket.emit("stop_typing", room);
    }, 1000);
  };

  return (
    <div style={{ fontFamily: "Arial", background: "#ece5dd", height: "100vh" }}>
      {!showChat ? (
        <div style={{ textAlign: "center", paddingTop: "100px" }}>
          <h2>Join Chat</h2>

          <input
            placeholder="Username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <br /><br />

          <input
            placeholder="Room ID..."
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />

          <br /><br />

          <button onClick={joinRoom}>Join Chat</button>
        </div>
      ) : (
        <div style={{ maxWidth: "600px", margin: "auto", paddingTop: "20px" }}>
          <h3>Room: {room}</h3>

          {/* 🔥 ONLINE USERS */}
          <div
            style={{
              background: "#fff",
              padding: "10px",
              borderRadius: "10px",
              marginBottom: "10px",
            }}
          >
            <h4>Online Users</h4>

            {onlineUsers.length === 0 ? (
              <p>No users online</p>
            ) : (
              onlineUsers.map((user, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ color: "green", marginRight: "8px" }}>●</span>
                  {user.username}
                </div>
              ))
            )}
          </div>

          {/* 🔹 MESSAGES */}
          <div
            style={{
              height: "400px",
              overflowY: "scroll",
              background: "#fff",
              padding: "10px",
              borderRadius: "10px",
            }}
          >
            {messageList.map((msg, index) => (
              <div
                key={index}
                style={{
                  textAlign: username === msg.author ? "right" : "left",
                  margin: "10px",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "10px",
                    borderRadius: "10px",
                    background:
                      username === msg.author ? "#dcf8c6" : "#fff",
                  }}
                >
                  <p>{msg.message}</p>
                  <small>
                    {msg.author} | {msg.time}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <p>{typingStatus}</p>

          {/* 🔹 INPUT */}
          <input
            type="text"
            value={currentMessage}
            placeholder="Type message..."
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            style={{ width: "80%", padding: "10px" }}
          />

          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;