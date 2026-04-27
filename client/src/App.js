import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("https://chat-app-server-qklq.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  const chatEndRef = useRef(null);

  // 🔥 Force join screen
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

  // ✅ Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  // ✅ Join room
  const joinRoom = () => {
    if (username.trim() !== "" && room.trim() !== "") {
      socket.emit("join_room", { room, username });
      setShowChat(true);
    }
  };

  // ✅ Send message
  const sendMessage = () => {
    if (currentMessage.trim() !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString(),
      };

      socket.emit("send_message", messageData);

      setMessageList((list) => [...list, messageData]);
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
    <div className="app">
      {!showChat ? (
        <div className="join-container">
          <h2>Join Chat</h2>

          <input
            placeholder="Username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            placeholder="Room ID..."
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />

          <button onClick={joinRoom}>Join Chat</button>
        </div>
      ) : (
        <div className="chat-container">
          <h3>Room: {room}</h3>

          {/* 🔥 ONLINE USERS */}
          <div className="online-users">
            <h4>Online Users</h4>

            {onlineUsers.length === 0 ? (
              <p>No users online</p>
            ) : (
              onlineUsers.map((user, index) => (
                <div key={index} className="user">
                  <span className="dot"></span>
                  {user.username}
                </div>
              ))
            )}
          </div>

          {/* 🔹 MESSAGES */}
          <div className="chat-box">
            {messageList.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.author === username
                    ? "message-row right"
                    : "message-row left"
                }
              >
                <div
                  className={
                    msg.author === username
                      ? "message sent"
                      : "message received"
                  }
                >
                  <p>{msg.message}</p>
                  <small>
                    {msg.author} | {msg.time}
                  </small>
                </div>
              </div>
            ))}

            <div ref={chatEndRef}></div>
          </div>

          <p className="typing">{typingStatus}</p>

          {/* 🔹 INPUT */}
          <div className="input-area">
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
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;