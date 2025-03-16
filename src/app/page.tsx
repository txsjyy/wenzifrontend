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
    <div style={{ padding: "2rem" }}>
      <h1>与 AI 聊天</h1>
      <div style={{ border: "1px solid #ccc", padding: "1rem", height: "300px", overflowY: "scroll", marginBottom: "1rem" }}>
        {chatHistory.map((msg, idx) => (
          <div key={idx} style={{ margin: "0.5rem 0" }}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="请输入消息"
        style={{ width: "300px", padding: "0.5rem" }}
      />
      <button onClick={sendChat} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
        发送
      </button>
      <br />
      <button onClick={() => router.push("/design")} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
        下一步：获取设计建议
      </button>
    </div>
  );
};

export default ChatPage;
