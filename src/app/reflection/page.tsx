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
    <div style={{ padding: "2rem" }}>
      <h1>情感反思</h1>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={reflectionInput}
          onChange={(e) => setReflectionInput(e.target.value)}
          placeholder="请输入您的反思"
          style={{ width: "300px", padding: "0.5rem" }}
        />
        <button onClick={handleSendReflection} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
          发送反思
        </button>
      </div>
      {reflection && (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ddd" }}>
          <h3>反思回复：</h3>
          <p>{reflection}</p>
        </div>
      )}
      <button onClick={() => router.push("/")} style={{ padding: "0.5rem 1rem", marginTop: "1rem" }}>
        重新开始对话
      </button>
    </div>
  );
};

export default ReflectionPage;
