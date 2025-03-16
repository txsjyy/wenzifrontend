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
    <div style={{ padding: "2rem" }}>
      <h1>生成的故事</h1>
      {narrative ? (
        <div style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ddd" }}>
          <p>{narrative}</p>
        </div>
      ) : (
        <p>正在生成故事……</p>
      )}
      <button onClick={() => router.push("/reflection")} style={{ padding: "0.5rem 1rem" }}>
        下一步：情感反思
      </button>
    </div>
  );
};

export default StoryPage;
