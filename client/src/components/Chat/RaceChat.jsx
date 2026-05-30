import { useState, useEffect, useRef } from "react";
import socket from "../../socket/socket";
import "./RaceChat.css";

const GG_PHRASES = ["GG!", "Well played!", "🔥🔥", "Nice race!", "GG WP!", "💪"];

function RaceChat({ roomId, username, isOpen, onToggle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      setMessages(prev => [...prev.slice(-99), msg]);
      if (!isOpen) setUnread(prev => prev + 1);
    });
    socket.on("ggReaction", ({ username: u }) => {
      setMessages(prev => [...prev.slice(-99), {
        id: Date.now(), username: u, message: "GG! 🎉",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isGg: true,
      }]);
      if (!isOpen) setUnread(prev => prev + 1);
    });
    return () => { socket.off("chatMessage"); socket.off("ggReaction"); };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [isOpen, messages]);

  const send = () => {
    if (!input.trim()) return;
    socket.emit("chatMessage", { roomId, message: input.trim(), username });
    setInput("");
  };

  const sendGg = () => {
    socket.emit("ggReaction", { roomId, username });
  };

  return (
    <div className={`race-chat ${isOpen ? "chat-open" : ""}`}>
      <button className="chat-toggle" onClick={onToggle}>
        💬 Chat {unread > 0 && !isOpen && <span className="chat-unread">{unread}</span>}
      </button>

      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>Race Chat</span>
            <button onClick={onToggle}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && <p className="chat-empty">Say hi to your opponent!</p>}
            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg ${msg.username === username ? "my-msg" : ""} ${msg.isGg ? "gg-msg" : ""}`}>
                <span className="msg-user">{msg.username === username ? "You" : msg.username}</span>
                <span className="msg-text">{msg.message}</span>
                <span className="msg-time">{msg.time}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="gg-bar">
            {GG_PHRASES.slice(0, 3).map(p => (
              <button key={p} className="gg-btn" onClick={() => {
                socket.emit("chatMessage", { roomId, message: p, username });
              }}>{p}</button>
            ))}
            <button className="gg-btn gg-btn--main" onClick={sendGg}>🎉 GG</button>
          </div>

          <div className="chat-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Message…"
              maxLength={200}
            />
            <button onClick={send}>→</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RaceChat;
