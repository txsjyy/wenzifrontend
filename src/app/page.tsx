// // pages.tsx

// "use client";

// import { useState, useEffect, useContext, FC } from "react";
// import { ChatContext, ChatMessage } from "./context/ChatContext";
// import { useRouter } from "next/navigation";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

// const ChatPage: FC = () => {
//   const { chatHistory, setChatHistory, sessionId } = useContext(ChatContext)!;
//   const [input, setInput] = useState<string>("");
//   const router = useRouter();
//   const hasUserInput = chatHistory.some(msg => msg.sender === "用户");
//   const [errorMessage, setErrorMessage] = useState<string>("");



//   // 页面加载时获取问候语
//   useEffect(() => {
//     fetch(`${API_URL}/api/start`)
//       .then((res) => res.json())
//       .then((data) => {
//         setChatHistory([{ sender: "系统", text: data.message }]);
//       })
//       .catch((err) => console.error("获取问候语时出错：", err));
//   }, [setChatHistory]);

//   // 发送聊天消息
//   const sendChat = async () => {
//     if (!input.trim()) return;
//     setChatHistory((prev: ChatMessage[]) => [...prev, { sender: "用户", text: input }]);
//     try {
//       const res = await fetch(`${API_URL}/api/chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ session_id: sessionId, input }),
//       });
//       const data = await res.json();
//       setChatHistory((prev: ChatMessage[]) => [...prev, { sender: "AI", text: data.response }]);
//     } catch (error) {
//       console.error("发送消息时出错：", error);
//     }
//     setInput("");
//   };

//   return (
//     <div style={{
//       display: "flex",
//       flexDirection: "column",
//       alignItems: "center",
//       justifyContent: "center",
//       minHeight: "100vh",
//       background: "linear-gradient(to bottom, #FFEBCD, #FFF5EE)",
//       fontFamily: "'Quicksand', sans-serif",
//     }}>
//       <h1 style={{ color: "#6A5ACD", marginBottom: "1rem" }}>🌿 与 AI 聊天 🌸</h1>
//       <div style={{
//         width: "96%",
//         maxWidth: "800px",
//         background: "rgba(255, 255, 255, 0.9)",
//         borderRadius: "16px",
//         padding: "1rem",
//         boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//         overflowY: "scroll",
//         height: "650px",
//         // marginBottom: "1rem",
//       }}>
//         {chatHistory.map((msg, idx) => (
//           <div key={idx} style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: msg.sender === "用户" ? "flex-end" : "flex-start",
//             marginBottom: "0.5rem",
//           }}>
//           <pre style={{
//             background: msg.sender === "用户" ? "#FFB6C1" : "#E6E6FA",
//             padding: "8px 12px",
//             borderRadius: "12px",
//             maxWidth: "80%",
//             whiteSpace: "pre-wrap",
//             wordBreak: "break-word",
//             fontFamily: "'Quicksand', sans-serif",
//             lineHeight: "1.5",
//             margin: 0,
//             boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
//           }}>
//             <strong>{msg.sender}:</strong> {msg.text}
//           </pre>

//           </div>
//         ))}
//       </div>
//       <div style={{
//         marginTop: "1rem",
//         display: "flex",
//         alignItems: "center",
//         width: "80%",
//         maxWidth: "500px",
//       }}>
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="请输入消息..."
//           style={{
//             flex: 1,
//             padding: "10px",
//             borderRadius: "12px",
//             border: "1px solid #ddd",
//             boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
//           }}
//         />
//         <button onClick={sendChat} style={{
//           marginLeft: "1rem",
//           padding: "10px 16px",
//           borderRadius: "12px",
//           border: "none",
//           background: "#6A5ACD",
//           color: "#fff",
//           cursor: "pointer",
//           transition: "background 0.3s",
//         }}>
//           发送
//         </button>
//       </div>
//       <button onClick={() => {
//   if (hasUserInput) {
//     setErrorMessage("");
//     router.push("/story");
//   } else {
//     setErrorMessage("请至少输入一条消息再继续 ✨");
//   }
// }}
//  style={{
//         marginTop: "1rem",
//         padding: "10px 16px",
//         borderRadius: "12px",
//         border: "none",
//         background: "#FFB6C1",
//         color: "#fff",
//         cursor: "pointer",
//         transition: "background 0.3s",
//       }}>
//         下一步：进入故事疗愈 💡
//       </button>
//       {errorMessage && (
//   <p style={{ color: "#D9534F", marginTop: "0.75rem", fontWeight: "bold" }}>
//     {errorMessage}
//   </p>
// )}

//     </div>
    
//   );
// };

// export default ChatPage;
"use client";
import { useEffect, useContext, useState } from "react";
import { ChatContext } from "./context/ChatContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
const MIN_REFLECTIONS = 10;
const FIXED_CODE = "AI2025HEAL2";
const reflectionIntro = "请慢慢说出你的感受，我们一起来反思故事带给你的共鸣与触动。你可以随时分享新的想法，我都会耐心聆听。";

type Step = "chat" | "story" | "reflection" | "done";

export default function UnifiedChatPage() {
  const { chatHistory, setChatHistory, sessionId, setNarrative } = useContext(ChatContext)!;
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("chat");
  const [isLoading, setIsLoading] = useState(false);
  const [reflectionCount, setReflectionCount] = useState(0);
  const [code, setCode] = useState("");

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

  // Step: Story (fetch from backend, insert as AI message)
  const handleFetchStory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/generate_narrative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      setNarrative(data.narrative); // If you want to save it to context
      setChatHistory(prev => [...prev, { sender: "AI", text: data.narrative }]);
      setStep("reflection");
    } finally {
      setIsLoading(false);
    }
  };

  // Get code after enough reflections
  const handleGetCode = async () => {
    setIsLoading(true);
    await fetch(`${API_URL}/api/end_session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    });
    setTimeout(() => {
      setCode(FIXED_CODE);
      setIsLoading(false);
      setStep("done");
    }, 800);
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
    // eslint-disable-next-line
  }, [chatHistory, step]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      minHeight: "100vh", background: "linear-gradient(to bottom,#FFEBCD,#FFF5EE)"
    }}>
      <h1 style={{ color: "#6A5ACD", marginTop: "2rem" }}>疗愈对话</h1>
      <div style={{
        width: "96%", maxWidth: "800px", background: "rgba(255,255,255,0.92)",
        borderRadius: "18px", padding: "1.5rem 1rem 1rem 1rem", margin: "1.5rem 0",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.08)", minHeight: 500, maxHeight: 600, overflowY: "auto"
      }}>
        {chatHistory.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.sender === "用户" ? "flex-end" : "flex-start",
            marginBottom: 12
          }}>
            <div style={{
              background: msg.sender === "用户" ? "#FFB6C1" : "#E6E6FA",
              color: "#444", borderRadius: 12, padding: "8px 14px", maxWidth: "75%",
              whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "1.05rem"
            }}>
              <strong>{msg.sender}:</strong> {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <div style={{ color: "#aaa", fontStyle: "italic" }}>AI正在思考...</div>}
      </div>

      {/* Input/controls */}
      {step === "chat" && (
        <>
          <div style={{ display: "flex", width: "80%", maxWidth: 500 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
              placeholder="请输入消息..."
              style={{
                flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid #ddd",
                boxShadow: "inset 0px 2px 4px rgba(0,0,0,0.1)"
              }}
              disabled={isLoading}
            />
            <button onClick={handleSend}
              style={{
                marginLeft: 16, padding: "10px 16px", borderRadius: 12, border: "none",
                background: "#6A5ACD", color: "#fff", fontWeight: 500,
                cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1
              }}
              disabled={isLoading}
            >发送</button>
          </div>
          <button
            style={{
              marginTop: "1.5rem", padding: "12px 26px", borderRadius: "12px",
              background: "#FFB6C1", color: "#fff", border: "none", fontWeight: 600,
              fontSize: "1.08rem", cursor: "pointer", transition: "background 0.3s"
            }}
            onClick={handleFetchStory}
            disabled={
              isLoading || !chatHistory.some(m => m.sender === "用户")
            }
            title={!chatHistory.some(m => m.sender === "用户") ? "请先与AI互动一条再进入故事" : undefined}
          >
            下一步：AI讲故事
          </button>
        </>
      )}

      {step === "story" && (
        <div style={{ color: "#6A5ACD", margin: "1rem 0" }}>
          AI正在准备你的故事...
        </div>
      )}

      {step === "reflection" && (
        <>
          <div style={{
            color: "#6A5ACD", marginBottom: 8, fontWeight: 500, fontSize: "1.05rem"
          }}>
            当前已反思：{reflectionCount} 次，还需 {Math.max(MIN_REFLECTIONS - reflectionCount, 0)} 次
          </div>
          <div style={{ display: "flex", width: "80%", maxWidth: 500 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
              placeholder="请分享你的反思感受..."
              style={{
                flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid #ddd",
                boxShadow: "inset 0px 2px 4px rgba(0,0,0,0.1)"
              }}
              disabled={isLoading}
            />
            <button onClick={handleSend}
              style={{
                marginLeft: 16, padding: "10px 16px", borderRadius: 12, border: "none",
                background: "#6A5ACD", color: "#fff", fontWeight: 500,
                cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1
              }}
              disabled={isLoading}
            >发送</button>
          </div>
          {reflectionCount >= MIN_REFLECTIONS && !code && (
            <button
              onClick={handleGetCode}
              style={{
                marginTop: "1.5rem", padding: "14px 28px", borderRadius: "14px",
                background: "#28b76b", color: "#fff", fontWeight: 600, fontSize: "1.1rem",
                border: "none", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1,
                transition: "background 0.3s"
              }}
              disabled={isLoading}
            >
              获取兑换码
            </button>
          )}
        </>
      )}

      {step === "done" && (
        <div style={{
          marginTop: "2rem", padding: "18px 24px", background: "#fffbe5",
          border: "2px dashed #28b76b", color: "#1d6434", fontSize: "1.15rem",
          fontWeight: 700, borderRadius: "14px", textAlign: "center", letterSpacing: "2px"
        }}>
          你的兑换码：<span style={{ fontWeight: 900 }}>{code}</span>
        </div>
      )}
    </div>
  );
}
