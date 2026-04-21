import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-app-server-qklq.onrender.com"); // ⚠️ replace with your Render backend URL

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const chatEndRef = useRef(null);

  const sendMessage = async () => {
    if (message !== "") {
      const messageData = {
        room: room,
        author: username,
        message: message,
        time:
          new Date().getHours() +
          ":" +
          new Date().getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  return (
    <div style={{ fontFamily: "Arial", background: "#ece5dd", height: "100vh" }}>
      {!showChat ? (
        <div style={{ textAlign: "center", paddingTop: "100px" }}>
          <h2>Join Chat</h2>

          <input
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: "10px", margin: "5px" }}
          />

          <input
            placeholder="Room ID"
            onChange={(e) => setRoom(e.target.value)}
            style={{ padding: "10px", margin: "5px" }}
          />

          <br />

          <button
            onClick={() => {
              if (username !== "" && room !== "") {
                socket.emit("join_room", room);
                setShowChat(true);
              }
            }}
            style={{ padding: "10px 20px", marginTop: "10px" }}
          >
            Join
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          
          {/* Header */}
          <div
            style={{
              background: "#075E54",
              color: "white",
              padding: "15px",
              fontWeight: "bold",
            }}
          >
            Room: {room}
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "scroll",
            }}
          >
            {messageList.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.author === username ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    background:
                      msg.author === username ? "#25D366" : "#ffffff",
                    color: "black",
                    padding: "10px",
                    borderRadius: "10px",
                    margin: "5px",
                    maxWidth: "60%",
                  }}
                >
                  <strong>{msg.author}</strong>
                  <p style={{ margin: 0 }}>{msg.message}</p>
                  <small>{msg.time}</small>
                </div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              padding: "10px",
              background: "#f0f0f0",
            }}
          >
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type message..."
              style={{ flex: 1, padding: "10px" }}
            />
            <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;