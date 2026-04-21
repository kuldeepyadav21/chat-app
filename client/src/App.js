import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-app-server-qklq.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const chatEndRef = useRef(null);

  const sendMessage = () => {
    if (message !== "") {
      const messageData = {
        room: room,
        author: username,
        message: message,
        time: new Date().toLocaleTimeString(),
      };

      socket.emit("send_message", messageData);
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  // ✅ FIXED: runs whenever messageList changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  return (
    <div style={{ textAlign: "center" }}>
      {!showChat ? (
        <div>
          <h2>Join Chat</h2>

          <input
            placeholder="Enter username..."
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            placeholder="Enter room ID..."
            onChange={(e) => setRoom(e.target.value)}
          />

          <button
            onClick={() => {
              if (username !== "" && room !== "") {
                socket.emit("join_room", room);
                setShowChat(true);
              }
            }}
          >
            Join
          </button>
        </div>
      ) : (
        <div>
          <h2>Real-Time Chat</h2>

          <div
            style={{
              height: "300px",
              border: "1px solid black",
              overflowY: "scroll",
            }}
          >
            {messageList.map((msg, index) => {
              return (
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
                        msg.author === username ? "#4CAF50" : "#e5e5ea",
                      color:
                        msg.author === username ? "white" : "black",
                      padding: "10px",
                      borderRadius: "10px",
                      margin: "5px",
                      maxWidth: "60%",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      <strong>{msg.author}</strong>: {msg.message}
                    </p>
                    <small>{msg.time}</small>
                  </div>
                </div>
              );
            })}

            {/* ✅ THIS WAS MISSING */}
            <div ref={chatEndRef}></div>
          </div>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message..."
          />

          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;