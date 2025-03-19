// pages/design.tsx
"use client";

import { useState, useContext, useEffect, FC } from "react";
import { ChatContext } from "../context/ChatContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DesignPage: FC = () => {
  const { chatHistory, designAdvice, setDesignAdvice, preferences, setPreferences } = useContext(ChatContext)!;
  const [storyType, setStoryType] = useState<string>(preferences.story_type);
  const [mode, setMode] = useState<string>(preferences.mode);
  const [style, setStyle] = useState<string>(preferences.style);
  const router = useRouter();

  const historyText = chatHistory.map(msg => `${msg.sender}: ${msg.text}`).join("\n");

  // 页面加载时获取设计建议
  useEffect(() => {
    if (!designAdvice) {
      fetch(`${API_URL}/api/design`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_history: historyText }),
      })
        .then(res => res.json())
        .then(data => {
          // 期望返回的数据格式为 { designAdvice: "..." }
          setDesignAdvice(data.designAdvice);
        })
        .catch(err => console.error("获取设计建议时出错：", err));
    }
  }, [designAdvice, historyText, setDesignAdvice]);

  const handleNext = () => {
    // 将偏好设置保存到上下文中
    setPreferences({ story_type: storyType, mode: mode, style: style });
    router.push("/story");
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
      <h1 style={{ color: "#6A5ACD", marginBottom: "1rem" }}>🌸 设计建议 🌿</h1>

      <div style={{
        width: "80%",
        maxWidth: "600px",
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "16px",
        padding: "1.5rem",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        marginBottom: "1rem",
      }}>
        <h3 style={{ color: "#6A5ACD", marginBottom: "0.5rem" }}>✨ AI 建议：</h3>
        {designAdvice ? (
          <p style={{ color: "#555", fontStyle: "italic", lineHeight: "1.6" }}>{designAdvice}</p>
        ) : (
          <p style={{ color: "#999" }}>正在加载设计建议……</p>
        )}
      </div>

      <div style={{
        width: "80%",
        maxWidth: "500px",
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "16px",
        padding: "1.5rem",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}>
        <label style={{ display: "block", marginBottom: "1rem" }}>
          <strong style={{ color: "#6A5ACD" }}>🌷 创作类型：</strong>
          <input
            type="text"
            value={storyType}
            onChange={(e) => setStoryType(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
              marginTop: "5px",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          <strong style={{ color: "#6A5ACD" }}>🌿 疗愈模式：</strong>
          <input
            type="text"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
              marginTop: "5px",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          <strong style={{ color: "#6A5ACD" }}>🌸 风格：</strong>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
              marginTop: "5px",
            }}
          />
        </label>
      </div>

      <button onClick={handleNext} style={{
        marginTop: "1.5rem",
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
        继续 ✨ 生成故事 📖
      </button>
    </div>
  );
};


export default DesignPage;
