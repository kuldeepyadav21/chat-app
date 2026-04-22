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

  // ✅ Auto join after refresh
  useEffect(() => {
    const savedUsername = localStorage.getItem("username");
    const savedRoom = localStorage.getItem("room");

    if (savedUsername && savedRoom) {
      setUsername(savedUsername);
      setRoom(savedRoom);
      setShowChat(true);

      socket.emit("join_room", savedRoom);
    }
  }, []);

  // ✅ Socket listeners
  useEffect(() => {
    socket.on("load_messages", (data) => {
      console.log("Loaded messages:", data);
      setMessageList(data);
    });

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
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
      socket.off("show_typing");
      socket.off("hide_typing");
    };
  }, []);

  // ✅ Join room
  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);

      localStorage.setItem("username", username);
      localStorage.setItem("room", room);

      setShowChat(true);
    }
  };

  // ✅ Send message
  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date().toLocaleTimeString(),
      };

      await socket.emit("send_message", messageData);
      
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
            onChange={(e) => setUsername(e.target.value)}
          />
          <br /><br />
          <input
            placeholder="Room ID..."
            onChange={(e) => setRoom(e.target.value)}
          />
          <br /><br />
          <button onClick={joinRoom}>Join Chat</button>
        </div>
      ) : (
        <div style={{ maxWidth: "600px", margin: "auto", paddingTop: "20px" }}>
          <h3>Room: {room}</h3>

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
                  textAlign:
                    username === msg.author ? "right" : "left",
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

          <input
            type="text"
            value={currentMessage}
            placeholder="Type message..."
            onChange={handleTyping}
            onKeyPress={(e) => {
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