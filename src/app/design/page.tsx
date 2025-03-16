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
    <div style={{ padding: "2rem" }}>
      <h1>设计建议</h1>
      {designAdvice ? (
        <div style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ddd" }}>
          <h3>AI 建议：</h3>
          <p>{designAdvice}</p>
        </div>
      ) : (
        <p>正在加载设计建议……</p>
      )}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          创作类型：{" "}
          <input
            type="text"
            value={storyType}
            onChange={(e) => setStoryType(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          疗愈模式：{" "}
          <input
            type="text"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <div style={{ marginBottom: "1rem" }}>
        <label>
          风格：{" "}
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <button onClick={handleNext} style={{ padding: "0.5rem 1rem" }}>
        下一步：生成故事
      </button>
    </div>
  );
};

export default DesignPage;
