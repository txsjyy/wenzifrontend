"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import { ChatContext } from "../context/ChatContext";
import { v4 as uuidv4 } from "uuid";

export default function EntryPage() {
  
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://101.33.214.139:5002"
  const { setSessionId } = useContext(ChatContext)!;
  const getOrCreateSessionId = () => {
      let id = localStorage.getItem("session_id");
      if (!id) {
        id = uuidv4().replace(/-/g, "").slice(0, 8);
        localStorage.setItem("session_id", id);
      }
      return id;
    };

  const handleNext = async () => {
    if (!description.trim()) {
      setError("请简述下您对体验规则的理解吧");
      return;
    }

    setLoading(true);
    const session_id = getOrCreateSessionId();
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: session_id,
            description,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to log in");
      }

      // Save to context
      setSessionId(session_id);
      // Go to next page
      router.push("/vanilla1");
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-b from-orange-50 to-pink-50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Dark mode toggle */}
      <button
        className="fixed top-2 right-2 z-50 h-10 w-20 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-200 font-bold shadow"
        onClick={() => {
          document.documentElement.classList.toggle("dark");
          localStorage.setItem(
            "ai_healing_darkmode",
            document.documentElement.classList.contains("dark") ? "true" : "false"
          );
        }}
      >
        {typeof window !== "undefined" && document.documentElement.classList.contains("dark")
          ? "🌞 白天"
          : "🌙 黑夜"}
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold mt-10 mb-6 text-indigo-600 dark:text-indigo-200">
        🌿 AI 心理疗愈对话 🌸
      </h1>

      {/* Entry form card */}
      <div className="bg-white/90 dark:bg-gray-800 rounded-2xl shadow-2xl w-[96%] max-w-xl p-8 space-y-6">
        <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">
          欢迎加入体验
        </h2>
        <p className="text-gray-800 dark:text-gray-200">     
          您将被邀请体验一个情绪疗愈AI（人工智能），与AI围绕刚刚回忆的情绪困扰进行沟通和交流。<br /><br />
          
          请以您感到舒适的方式与AI互动。您所提供的所有信息将得到充分保护，并仅用于科研目的。
        </p>
        
        {/* Short Description */}
        <div>
          <label htmlFor="description" className="block font-medium mb-1 dark:text-gray-200">
            体验规则简述
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 dark:text-gray-100 shadow-inner"
            placeholder="请写下你对这次体验的理解"
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* Continue Button */}
        <button
          onClick={handleNext}
          disabled={loading}
          className={`w-full py-3 text-lg rounded-xl font-semibold transition duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-500 hover:bg-indigo-600 text-white"
          }`}
        >
          {loading ? "Processing..." : "开始体验"}
        </button>
      </div>
    </div>
  );
}
