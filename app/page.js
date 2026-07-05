"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Main aapka AI assistant hoon. Kuch bhi pochiye 😊" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages([...newMessages, { role: "assistant", content: "Error: " + data.error }]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      }
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "Network error, dobara try karo." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>Gemini Chatbot</header>
      <div style={styles.chatBox}>
        {messages.map((m, i) => (
          <div key={i} style={{
            ...styles.bubble,
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            background: m.role === "user" ? "#4f46e5" : "#f1f1f1",
            color: m.role === "user" ? "#fff" : "#000",
          }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.bubble, alignSelf: "flex-start", background: "#f1f1f1" }}>
            Typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={styles.inputRow}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Apna message likho..."
          rows={1}
          style={styles.input}
        />
        <button onClick={sendMessage} disabled={loading} style={styles.button}>
          Send
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", height: "100vh", maxWidth: 600, margin: "0 auto", border: "1px solid #e5e5e5" },
  header: { padding: "16px", fontWeight: 600, fontSize: 18, borderBottom: "1px solid #e5e5e5", background: "#4f46e5", color: "#fff" },
  chatBox: { flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  bubble: { padding: "10px 14px", borderRadius: 14, maxWidth: "75%", whiteSpace: "pre-wrap", lineHeight: 1.4 },
  inputRow: { display: "flex", gap: 8, padding: 12, borderTop: "1px solid #e5e5e5" },
  input: { flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc", resize: "none", fontSize: 14 },
  button: { padding: "0 18px", borderRadius: 8, border: "none", background: "#4f46e5", color: "#fff", fontWeight: 600, cursor: "pointer" },
};
