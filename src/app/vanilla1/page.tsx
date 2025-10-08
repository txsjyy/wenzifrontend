"use client";

import { useState, useEffect, useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://101.33.214.139:5002";

const MIN_REFLECTIONS = 10;


const WELCOME_MESSAGE = `你好，我是一名心理疗愈机器人，感谢你愿意在这里分享。
你可以慢慢告诉我你最近遇到的情绪困境。无论是关于工作、学业上的压力，经济方面的焦虑，身体或心理上的不适，还是在人际关系中的烦恼与失落，都可以随意向我倾诉。我会认真聆听，不评判、不催促。
你愿意和我说说看吗？`;

const SingleChatPage = () => {
  const { chatHistory, setChatHistory, sessionId} = useContext(ChatContext)!;
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string>("");
  const [gettingCode, setGettingCode] = useState(false);
    const { setSessionId } = useContext(ChatContext)!;
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  // Toggle dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // optional: persist user choice
    localStorage.setItem("singlechat_darkmode", darkMode ? "true" : "false");
  }, [darkMode]);
  useEffect(() => {
  // 如果 context 里还没有 sessionId，就从 localStorage 取回来
    if (!sessionId) {
      const storedId = localStorage.getItem("session_id");
      if (storedId) {
        setSessionId(storedId);
        console.log("🔄 Restored session_id from localStorage:", storedId);
      } else {
        console.warn("⚠️ No session_id found in localStorage");
      }
    }
  }, [sessionId, setSessionId]);


  // 👇 Directly set welcome message on mount (no AI call)
  useEffect(() => {
    setChatHistory([{ sender: "系统", text: WELCOME_MESSAGE }]);
  }, [setChatHistory]);

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
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-b from-orange-50 to-pink-50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Dark mode toggle, fixed top right */}
      <button
        className="fixed top-2 right-2 z-50 h-10 w-20 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-200 font-bold shadow"
        onClick={() => setDarkMode(d => !d)}
        aria-label="切换深色模式"
      >
        {darkMode ? "🌞 白天" : "🌙 黑夜"}
      </button>

      <h1 className="text-2xl font-bold mt-10 mb-2 text-indigo-600 dark:text-indigo-200">🌿 AI 心理疗愈对话 🌸</h1>

       {/* Instruction bar */}
      <div className="w-full max-w-xl bg-white/90 dark:bg-gray-800 rounded-xl px-5 py-3 mb-4 shadow text-indigo-600 dark:text-indigo-200 font-medium text-base">
        你需要与AI进行至少 <strong style={{ color: "#FF69B4" }}>{MIN_REFLECTIONS}</strong> 次对话才能完成体验。<br />
        当前已完成：<strong>{userReflectionCount}</strong> 次，还需<strong>{remaining}</strong>次。
      </div>
      <div className="w-[96%] max-w-2xl bg-white/95 dark:bg-gray-800 rounded-2xl p-6 shadow-lg overflow-y-auto h-[650px] mb-4">
        {chatHistory.map((msg, idx) => (
          <div key={idx} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: msg.sender === "用户" ? "flex-end" : "flex-start",
            marginBottom: "0.5rem",
          }}>
            <pre className={`
              ${msg.sender === "用户"
                ? "bg-pink-200 dark:bg-indigo-400"
                : "bg-purple-100 dark:bg-indigo-950"}
              text-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 max-w-[80%]
              whitespace-pre-wrap break-words font-sans text-base shadow
              `}
              style={{ margin: 0, lineHeight: "1.5" }}
            >
              <strong>{msg.sender}:</strong> {msg.text}
            </pre>
          </div>
        ))}
        {loading && (
          <div className="text-indigo-400 dark:text-indigo-300 my-2">AI正在回复中...</div>
        )}
      </div>
      <div className="mt-4 flex items-center w-[96%] max-w-2xl">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入消息..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-indigo-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-base shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
          onKeyDown={e => {
            if (e.key === "Enter" && !loading) sendChat();
          }}
          disabled={loading}
        />
        <button 
          onClick={sendChat}
          className={`
              ml-4 px-6 py-3 rounded-xl font-semibold text-white text-base
              bg-indigo-500 hover:bg-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-600
              transition-all duration-200
              ${loading ? "opacity-60 cursor-not-allowed" : ""}
            `} 
          disabled={loading}>
          发送
        </button>
      </div>
      {remaining === 0 && !code && (
        <button
          className={`
            mt-6 px-8 py-4 rounded-xl font-bold text-white text-lg
            bg-green-500 dark:bg-green-600
            shadow transition-all
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          disabled={gettingCode}
          onClick={async () => {
            setGettingCode(true);
            try {
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
        <div className="
          mt-8 px-8 py-6 bg-yellow-50 dark:bg-green-900 border-2 border-dashed border-green-500 dark:border-green-400
          text-green-700 dark:text-green-200 text-lg font-bold rounded-xl text-center tracking-wider
        ">
          你的兑换码：<span style={{ fontWeight: 900 }}>{code}</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
              // 临时状态提示
              const btn = document.getElementById("copy-btn");
              if (btn) {
                btn.textContent = "✅ 已复制";
                setTimeout(() => (btn.textContent = "📋 复制"), 1500);
              }
            }}
            id="copy-btn"
            className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all duration-200 shadow-md"
          >
            📋 复制
          </button>
        </div>
        
      )}

    </div>
  );
};

export default SingleChatPage;
