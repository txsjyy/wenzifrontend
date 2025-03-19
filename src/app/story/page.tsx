// pages/story.tsx
"use client";

import { useEffect, useContext, FC } from "react";
import { ChatContext } from "../context/ChatContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const StoryPage: FC = () => {
  const { chatHistory, preferences, narrative, setNarrative } = useContext(ChatContext)!;
  const router = useRouter();

  const historyText = chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join("\n");

  useEffect(() => {
    if (!narrative) {
      const payload = {
        ...preferences,
        chat_history: historyText,
      };
      fetch(`${API_URL}/api/generate_narrative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(res => res.json())
        .then(data => {
          setNarrative(data.narrative);
        })
        .catch(err => console.error("生成故事时出错：", err));
    }
  }, [narrative, preferences, historyText, setNarrative]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #FFD1DC, #FFF5EE)",
      fontFamily: "'Quicksand', sans-serif",
      textAlign: "center",
    }}>
      <h1 style={{ color: "#6A5ACD", marginBottom: "1rem" }}>📖 你的疗愈故事 ✨</h1>

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
        {narrative ? (
          <p style={{ color: "#555", lineHeight: "1.8" }}>{narrative}</p>
        ) : (
          <p style={{ color: "#999" }}>🌙 正在生成你的故事……请稍等 🌸</p>
        )}
      </div>

      <button onClick={() => router.push("/reflection")} style={{
        padding: "12px 20px",
        borderRadius: "12px",
        border: "none",
        background: "#6A5ACD",
        color: "#fff",
        fontSize: "1rem",
        cursor: "pointer",
        transition: "background 0.3s",
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
      }}>
        继续 💭 进入情感反思 🌿
      </button>
    </div>
  );
};

export default StoryPage;
