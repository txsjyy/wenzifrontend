// pages.tsx

"use client";

import { useState, useEffect, useContext, FC } from "react";
import { ChatContext, ChatMessage } from "./context/ChatContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ChatPage: FC = () => {
  const { chatHistory, setChatHistory } = useContext(ChatContext)!;
  const [input, setInput] = useState<string>("");
  const router = useRouter();
  const hasUserInput = chatHistory.some(msg => msg.sender === "用户");
  const [errorMessage, setErrorMessage] = useState<string>("");



  // 页面加载时获取问候语
  useEffect(() => {
    fetch(`${API_URL}/api/start`)
      .then((res) => res.json())
      .then((data) => {
        setChatHistory([{ sender: "系统", text: data.message }]);
      })
      .catch((err) => console.error("获取问候语时出错：", err));
  }, [setChatHistory]);

  // 发送聊天消息
  const sendChat = async () => {
    if (!input.trim()) return;
    setChatHistory((prev: ChatMessage[]) => [...prev, { sender: "用户", text: input }]);
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setChatHistory((prev: ChatMessage[]) => [...prev, { sender: "AI", text: data.response }]);
    } catch (error) {
      console.error("发送消息时出错：", error);
    }
    setInput("");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #FFEBCD, #FFF5EE)",
      fontFamily: "'Quicksand', sans-serif",
    }}>
      <h1 style={{ color: "#6A5ACD", marginBottom: "1rem" }}>🌿 与 AI 聊天 🌸</h1>
      <div style={{
        width: "80%",
        maxWidth: "500px",
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "16px",
        padding: "1rem",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        overflowY: "scroll",
        height: "400px",
      }}>
        {chatHistory.map((msg, idx) => (
          <div key={idx} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: msg.sender === "用户" ? "flex-end" : "flex-start",
            marginBottom: "0.5rem",
          }}>
          <pre style={{
            background: msg.sender === "用户" ? "#FFB6C1" : "#E6E6FA",
            padding: "8px 12px",
            borderRadius: "12px",
            maxWidth: "80%",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontFamily: "'Quicksand', sans-serif",
            lineHeight: "1.5",
            margin: 0,
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </pre>

          </div>
        ))}
      </div>
      <div style={{
        marginTop: "1rem",
        display: "flex",
        alignItems: "center",
        width: "80%",
        maxWidth: "500px",
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入消息..."
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        />
        <button onClick={sendChat} style={{
          marginLeft: "1rem",
          padding: "10px 16px",
          borderRadius: "12px",
          border: "none",
          background: "#6A5ACD",
          color: "#fff",
          cursor: "pointer",
          transition: "background 0.3s",
        }}>
          发送
        </button>
      </div>
      <button onClick={() => {
  if (hasUserInput) {
    setErrorMessage("");
    router.push("/design");
  } else {
    setErrorMessage("请至少输入一条消息再继续 ✨");
  }
}}
 style={{
        marginTop: "1rem",
        padding: "10px 16px",
        borderRadius: "12px",
        border: "none",
        background: "#FFB6C1",
        color: "#fff",
        cursor: "pointer",
        transition: "background 0.3s",
      }}>
        下一步：获取设计建议 💡
      </button>
      {errorMessage && (
  <p style={{ color: "#D9534F", marginTop: "0.75rem", fontWeight: "bold" }}>
    {errorMessage}
  </p>
)}

    </div>
    
  );
};

export default ChatPage;
