
// export default ChatPage;
"use client";
import { useEffect, useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://101.33.214.139:5002";
const MIN_REFLECTIONS = 5;
const reflectionIntro = "请慢慢说出你的感受，我们一起来反思故事带给你的共鸣与触动。你可以随时分享新的想法，我都会耐心聆听。";

type Step = "chat" | "story" | "reflection" | "done";

export default function UnifiedChatPage() {
  const { chatHistory, setChatHistory, sessionId} = useContext(ChatContext)!;
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [code, setCode] = useState("");
    const { setSessionId } = useContext(ChatContext)!;
  const userMessageCount = chatHistory.filter(m => m.sender === "用户").length;
// Tailwind/dark mode state
  const [darkMode, setDarkMode] = useState(
    typeof window !== "undefined"
      ? (localStorage.getItem("ai_healing_darkmode") === "true")
      : false
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("ai_healing_darkmode", darkMode ? "true" : "false");
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

  // Greeting on mount
  useEffect(() => {
    if (chatHistory.length === 0) {
      fetch(`${API_URL}/api/start`)
        .then(res => res.json())
        .then(data => setChatHistory([{ sender: "系统", text: data.message }]));
    }
    // eslint-disable-next-line
  }, []);

  // Insert reflection intro when entering reflection step
  useEffect(() => {
    if (step === "reflection" && !chatHistory.some(m => m.text === reflectionIntro)) {
      setChatHistory(prev => [...prev, { sender: "AI", text: reflectionIntro }]);
    }
    // eslint-disable-next-line
  }, [step]);

  // Main send handler
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setChatHistory(prev => [...prev, { sender: "用户", text: input }]);
    setInput("");
    setIsLoading(true);
    if (
      input.trim() === "下一步" &&
      step === "chat" &&
      userMessageCount >= 3
    ) {
      setInput("");
      await handleFetchStory();
      return;
    }

    // If not enough reflections, give feedback
    if (
      input.trim() === "下一步" &&
      step === "chat" &&
      userMessageCount < 3
    ) {
      setChatHistory(prev => [
        ...prev,
        { sender: "系统", text: "⚠️ 请先和我多聊聊，至少三次反思后才能进入下一步。" }
      ]);
      setIsLoading(false);
      return;
    }
    if (step === "chat") {
      // Normal chat
      try {
        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, input }),
        });
        const data = await res.json();
        setChatHistory(prev => [...prev, { sender: "AI", text: data.response }]);
      } finally {
        setIsLoading(false);
      }
    } else if (step === "reflection") {
      // Reflection
      setReflectionCount(c => c + 1);
      try {
        const res = await fetch(`${API_URL}/api/reflect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, input }),
        });
        const data = await res.json();
        setChatHistory(prev => [...prev, { sender: "AI", text: data.reflection }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

// Step: Story (stream from backend, append as AI message incrementally)
const handleFetchStory = async () => {
  setIsLoading(true);
  setStep("story");

  const es = new EventSource(
    `${API_URL}/api/generate_narrative_sse?session_id=${encodeURIComponent(sessionId)}`
  );

  // 记录新建的 AI 占位符索引
  let placeholderIndex = -1;

  es.addEventListener("message", (evt: MessageEvent) => {
    try {
      const { text } = JSON.parse(evt.data);
      if (!text) return;

      // 第一次收到 message 再建 placeholder
      if (placeholderIndex === -1) {
        setChatHistory(prev => {
          const next = [...prev];
          next.push({ sender: "AI", text: "" });
          placeholderIndex = next.length - 1;
          return next;
        });
      }

      // 追加内容
      setChatHistory(prev => {
        const next = [...prev];
        if (placeholderIndex >= 0 && placeholderIndex < next.length) {
          next[placeholderIndex] = {
            ...next[placeholderIndex],
            text: next[placeholderIndex].text + text,
          };
        }
        return next;
      });
    } catch {
      // 忽略格式错误的 frame
    }
  });

  es.addEventListener("done", () => {
    es.close();
    setIsLoading(false);
    setStep("reflection");
  });

  es.addEventListener("error", (evt) => {
    console.error("SSE error", evt);
    es.close();
    setIsLoading(false);
  });
};



const handleGetCode = async () => {
  setIsLoading(true);
  try {
    // instead of fixed code, show the user their sessionId
    setTimeout(() => {
      setCode(sessionId);
      setStep("done");
      setIsLoading(false);
    }, 800);
  } catch (err) {
    console.error("End session error:", err);
    setIsLoading(false);
  }
};


  // Count reflections (user messages after story step, in reflection step)
  useEffect(() => {
    if (step === "reflection") {
      // Count messages from user after reflection started
      let count = 0;
      let foundIntro = false;
      for (const msg of chatHistory) {
        if (msg.text === reflectionIntro) foundIntro = true;
        if (foundIntro && msg.sender === "用户") count += 1;
      }
      setReflectionCount(count);
    }
  }, [chatHistory, step]);

  return (
    <div className="relative flex flex-col items-center min-h-screen bg-gradient-to-b from-orange-50 to-pink-50 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
  {/* Fixed dark mode toggle */}
  <button
    className="fixed top-2 right-2 z-50 h-10 w-20 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-200 font-bold shadow"
    onClick={() => setDarkMode(d => !d)}
    aria-label="切换深色模式"
  >
    {darkMode ? "🌞 白天" : "🌙 黑夜"}
  </button>

      <h1 className="text-2xl font-bold mt-10 mb-2 text-indigo-600 dark:text-indigo-200">🌿 AI 心理疗愈对话 🌸</h1>

      {step === "reflection" && (
      <div className="w-full max-w-xl bg-white/90 dark:bg-gray-800 rounded-xl px-5 py-3 mb-4 shadow text-indigo-600 dark:text-indigo-200 font-medium text-base">
        你需要与AI反思交互至少 <strong style={{ color: "#FF69B4" }}>{MIN_REFLECTIONS}</strong> 次才能完成体验。<br />
        当前已完成：<strong>{reflectionCount}</strong> 次，还需<strong>{Math.max(MIN_REFLECTIONS - reflectionCount, 0)}</strong>次。
      </div>
      
      )}
      {step === "chat" && (
        <div className="w-full max-w-xl bg-white/90 dark:bg-gray-800 rounded-xl px-5 py-3 mb-4 shadow text-indigo-600 dark:text-indigo-200 font-medium text-base">
          💡 使用说明：  
          <br />
          1. 请先和我进行至少 <strong>3 次对话</strong>，充分表达你的情感困境。  
          <br />
          2. 完成后，输入 <strong>“下一步”</strong> 或点击 📖 按钮，即可生成你的专属疗愈故事。  
        </div>
      )}


      {/* Chat history card */}
      <div className="w-[96%] max-w-2xl bg-white/90 dark:bg-gray-800 rounded-2xl px-4 py-6 my-6 shadow-lg min-h-[500px] max-h-[600px] overflow-y-auto">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex mb-3 ${msg.sender === "用户" ? "justify-end" : "justify-start"}`}>
            <div className={`
              ${msg.sender === "用户"
                ? "bg-pink-200 dark:bg-indigo-400"
                : "bg-purple-100 dark:bg-indigo-950"}
              text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2 max-w-[75%] whitespace-pre-wrap break-words text-base shadow`}
            >
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <div style={{ color: "#aaa", fontStyle: "italic" }}>AI正在思考...</div>}
      </div>

      {/* Input/controls */}
      {step === "chat" && (
        <>
          <div className="mt-4 flex items-center w-[96%] max-w-2xl">
            <div className="relative group mr-4">
                <button
                    className={`
                    w-12 h-12 flex items-center justify-center
                    rounded-xl font-bold text-white text-2xl
                    bg-indigo-500 dark:bg-indigo-700
                    shadow transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                    onClick={handleFetchStory}
                    disabled={isLoading || userMessageCount < 3}
                    aria-label="生成新故事"
                    type="button"
                    >
                    <span role="img" aria-label="生成新故事">📖</span>
                </button>
                {/* tooltip */}
                <div className="
                    absolute left-1/2 top-full mt-2 -translate-x-1/2
                    px-3 py-1 rounded bg-black/80 text-white text-xs
                    opacity-0 group-hover:opacity-100 pointer-events-none
                    whitespace-nowrap transition-opacity
                    z-10
                ">
                生成新故事
                </div>
            </div>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
              placeholder="请输入消息..."
              className="flex-1 px-4 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
              disabled={isLoading}
            /> 
            <button onClick={handleSend}
              className={`
                ml-4 px-4 py-2 rounded-xl font-semibold text-white
                bg-indigo-500 hover:bg-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-600
                transition-all duration-200
                ${isLoading ? "opacity-60 cursor-not-allowed" : ""}
              `}
              disabled={isLoading}
            >发送</button>
          </div>   
        </>
      )}

      {step === "story" && (
        <div style={{ color: "#6A5ACD", margin: "1rem 0" }}>
          AI正在准备你的故事...
        </div>
      )}

      {step === "reflection" && (
        <>
        <div className="text-indigo-600 dark:text-indigo-200 font-semibold mb-2 text-base">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
              placeholder="请分享你的反思感受..."
              className="flex-1 px-4 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
              disabled={isLoading}
            />
            <button onClick={handleSend}
              className={`
                ml-4 px-4 py-2 rounded-xl font-semibold text-white
                bg-indigo-500 hover:bg-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-600
                transition-all duration-200
                ${isLoading ? "opacity-60 cursor-not-allowed" : ""}
              `}
              disabled={isLoading}
            >发送</button>
          </div>
          {reflectionCount >= MIN_REFLECTIONS && !code && (
            <button
              onClick={handleGetCode}
              className={`
                mt-6 px-8 py-4 rounded-xl font-bold text-white text-lg
                bg-green-500 dark:bg-green-600
                shadow transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              disabled={isLoading}
            >
              获取兑换码
            </button>
          )}
        </>
      )}

      {step === "done" && (
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
}
