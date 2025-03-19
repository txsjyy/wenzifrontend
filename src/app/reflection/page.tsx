// pages/reflection.tsx
"use client";

import { useState, useContext, FC } from "react";
import { ChatContext } from "../context/ChatContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const ReflectionPage: FC = () => {
  const { chatHistory, reflection, setReflection } = useContext(ChatContext)!;
  const [reflectionInput, setReflectionInput] = useState<string>("");
  const router = useRouter();

  const historyText = chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join("\n");

  const handleSendReflection = async () => {
    fetch(`${API_URL}/api/reflect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history_chat: historyText, input: reflectionInput }),
    })
      .then(res => res.json())
      .then(data => {
        setReflection(data.reflection);
      })
      .catch(err => console.error("发送反思时出错：", err));
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #D8BFD8, #FFF5EE)",
      fontFamily: "'Quicksand', sans-serif",
      textAlign: "center",
    }}>
      <h1 style={{ color: "#6A5ACD", marginBottom: "1rem" }}>🌿 情感反思 💭</h1>

      <div style={{
        width: "80%",
        maxWidth: "600px",
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "16px",
        padding: "1.5rem",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        marginBottom: "1rem",
        animation: "fadeIn 1s ease-in-out",
      }}>
        <h3 style={{ color: "#6A5ACD", marginBottom: "0.5rem" }}>💜 你的感受</h3>
        <input
          type="text"
          value={reflectionInput}
          onChange={(e) => setReflectionInput(e.target.value)}
          placeholder="请分享你的感受..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "12px",
            border: "1px solid #ddd",
            boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
            marginBottom: "10px",
          }}
        />
        <button onClick={handleSendReflection} style={{
          padding: "10px 16px",
          borderRadius: "12px",
          border: "none",
          background: "#6A5ACD",
          color: "#fff",
          fontSize: "1rem",
          cursor: "pointer",
          transition: "background 0.3s",
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
        }}>
          发送反思 ✨
        </button>
      </div>

      {reflection && (
        <div style={{
          width: "80%",
          maxWidth: "600px",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          marginTop: "1rem",
          animation: "fadeIn 1s ease-in-out",
        }}>
          <h3 style={{ color: "#6A5ACD" }}>💫 AI 反思回应</h3>
          <p style={{ color: "#555", lineHeight: "1.6" }}>{reflection}</p>
        </div>
      )}

      <button onClick={() => router.push("/")} style={{
        marginTop: "1.5rem",
        padding: "12px 20px",
        borderRadius: "12px",
        border: "none",
        background: "#FFB6C1",
        color: "#fff",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "background 0.3s",
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
      }}>
        🔄 重新开始 🌱
      </button>
    </div>
  );
};

export default ReflectionPage;
