"use client";

import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://101.33.214.139:5002";

type ChatMessage = {
  sender: string;
  text: string;
};

const MIN_REFLECTIONS = 10;

// Universal UUID v4 generator, always works in browser
function uuidv4(): string {
  if (typeof window !== "undefined" && typeof crypto !== "undefined" && crypto.getRandomValues) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } else {
    // Fallback if crypto.getRandomValues is not available (should rarely happen)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("session_id");
  if (!id) {
    id = uuidv4();
    localStorage.setItem("session_id", id);
  }
  return id;
}

const WELCOME_MESSAGE = `你好，我是一名心理疗愈机器人，感谢你愿意在这里分享。
你可以慢慢告诉我你最近遇到的情绪困境。无论是关于工作、学业上的压力，经济方面的焦虑，身体或心理上的不适，还是在人际关系中的烦恼与失落，都可以随意向我倾诉。我会认真聆听，不评判、不催促。
你愿意和我说说看吗？`;

const SingleChatPage = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string>("");
  const [gettingCode, setGettingCode] = useState(false);
  const sessionId = getOrCreateSessionId();

  // 👇 Directly set welcome message on mount (no AI call)
  useEffect(() => {
    setChatHistory([{ sender: "系统", text: WELCOME_MESSAGE }]);
  }, []);

  // Send chat
  const sendChat = async () => {
    if (!input.trim()) return;
    setChatHistory((prev) => [...prev, { sender: "用户", text: input }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/pure_deepseek_chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, input }),
      });
      const data = await res.json();
      setChatHistory((prev) => [
        ...prev,
        { sender: "AI", text: data.response || data.error || "⚠️ 未获取到AI回复。" },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "系统", text: "⚠️ 发送失败，请稍后重试。" },
      ]);
      console.error("发送消息时出错：", error);
    }
    setInput("");
    setLoading(false);
  };

  // --- Instruction bar logic ---
  const userReflectionCount = chatHistory.filter(msg => msg.sender === "用户").length;
  const remaining = Math.max(MIN_REFLECTIONS - userReflectionCount, 0);
  const FIXED_CODE = "AI2025HEAL1"; 
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
      <h1 style={{ color: "#6A5ACD", marginBottom: "1rem" }}>🌿 AI 心理疗愈对话 🌸</h1>
       {/* Instruction bar */}
      <div style={{
        width: "100%",
        maxWidth: "520px",
        background: "rgba(255,255,255,0.97)",
        borderRadius: "12px",
        padding: "0.75rem 1.2rem",
        marginBottom: "1rem",
        boxShadow: "0px 2px 6px rgba(0,0,0,0.04)",
        color: "#6A5ACD",
        fontWeight: 500,
        fontSize: "1.05rem"
      }}>
        你需要与AI反思交互至少 <strong style={{ color: "#FF69B4" }}>{MIN_REFLECTIONS}</strong> 次才能完成体验。<br />
        当前已完成：<strong>{userReflectionCount}</strong> 次，还需<strong>{remaining}</strong>次。
      </div>
      <div style={{
        width: "96%",
        maxWidth: "800px",
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "24px",
        padding: "1.5rem",
        boxShadow: "0px 6px 16px rgba(0,0,0,0.13)",
        overflowY: "auto",
        height: "650px",
        marginBottom: "1rem",
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
              boxShadow: "0px 2px 5px rgba(0,0,0,0.10)",
            }}>
              <strong>{msg.sender}:</strong> {msg.text}
            </pre>
          </div>
        ))}
        {loading && (
          <div style={{ color: "#6A5ACD", margin: "1rem 0" }}>AI正在回复中...</div>
        )}
      </div>
      <div style={{
        marginTop: "1rem",
        display: "flex",
        alignItems: "center",
        width: "96%",
        maxWidth: "800px",
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入消息..."
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "14px",
            border: "1px solid #ddd",
            fontSize: "1rem",
            boxShadow: "inset 0px 2px 4px rgba(0,0,0,0.10)",
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && !loading) sendChat();
          }}
          disabled={loading}
        />
        <button onClick={sendChat} style={{
          marginLeft: "1rem",
          padding: "12px 22px",
          borderRadius: "14px",
          border: "none",
          background: "#6A5ACD",
          color: "#fff",
          fontWeight: 600,
          fontSize: "1.05rem",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "background 0.3s",
        }} disabled={loading}>
          发送
        </button>
      </div>
      {remaining === 0 && !code && (
        <button
          style={{
            marginTop: "1.5rem",
            padding: "14px 28px",
            borderRadius: "14px",
            background: "#28b76b",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1.1rem",
            border: "none",
            cursor: gettingCode ? "not-allowed" : "pointer",
            opacity: gettingCode ? 0.7 : 1,
            transition: "background 0.3s",
          }}
          disabled={gettingCode}
          onClick={async () => {
            setGettingCode(true);
            try {
              // Call backend to end session/cleanup
              await fetch(`${API_URL}/api/end_session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId }),
              });
              // Wait for a short time for a better UI feel (optional)
              setTimeout(() => {
                setCode(FIXED_CODE);
                setGettingCode(false);
              }, 800);
            } catch {
              setCode("⚠️ 获取兑换码失败，请稍后重试");
              setGettingCode(false);
            }
          }}
        >
          获取兑换码
        </button>
      )}

      {code && (
        <div style={{
          marginTop: "2rem",
          padding: "18px 24px",
          background: "#fffbe5",
          border: "2px dashed #28b76b",
          color: "#1d6434",
          fontSize: "1.15rem",
          fontWeight: 700,
          borderRadius: "14px",
          textAlign: "center",
          letterSpacing: "2px"
        }}>
          你的兑换码：<span style={{ fontWeight: 900 }}>{code}</span>
        </div>
      )}

    </div>
  );
};

export default SingleChatPage;
