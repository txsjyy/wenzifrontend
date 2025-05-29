"use client";

import { useEffect, useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const MIN_REFLECTIONS = 10;

const StoryReflectionPage = () => {
  const { narrative, setNarrative, sessionId } = useContext(ChatContext)!;
  const [code, setCode] = useState<string>("");
  const [gettingCode, setGettingCode] = useState(false);
  const [reflectionInput, setReflectionInput] = useState<string>("");
  const [reflectionHistory, setReflectionHistory] = useState<{ sender: string; text: string }[]>([]);
  const [isReflecting, setIsReflecting] = useState<boolean>(false);
  const FIXED_CODE = "AI2025HEAL2"; 

  // 自动获取故事（如未生成）
  useEffect(() => {
    if (!narrative) {
      fetch(`${API_URL}/api/generate_narrative`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      })
        .then(res => res.json())
        .then(data => setNarrative(data.narrative))
        .catch(err => console.error("生成故事时出错：", err));
    }
  }, [narrative, setNarrative, sessionId]);

  // 统计用户反思次数
  const userReflectionCount = reflectionHistory.filter(msg => msg.sender === "用户").length;
  const remaining = Math.max(MIN_REFLECTIONS - userReflectionCount, 0);

  // 发送反思内容
// 发送反思内容
const handleSendReflection = async () => {
  if (!reflectionInput.trim() || isReflecting) return;
  const currentInput = reflectionInput;
  setReflectionHistory(prev => [...prev, { sender: "用户", text: currentInput }]);
  setReflectionInput("");
  setIsReflecting(true);
  try {
    const res = await fetch(`${API_URL}/api/reflect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, input: currentInput }),
    });
    const data = await res.json();
    setReflectionHistory(prev => [...prev, { sender: "AI", text: data.reflection }]);
  } catch (err) {
    setReflectionHistory(prev => [...prev, { sender: "AI", text: "⚠️ 反思请求失败，请稍后重试。" }]);
    console.error("发送反思时出错：", err);
  } finally {
    setIsReflecting(false);
  }
};

  return (
    <div style={{
      display: "flex",
      flexDirection: "row",
      minHeight: "100vh",
      background: "linear-gradient(to bottom right, #FFD1DC 70%, #D8BFD8 100%)",
      fontFamily: "'Quicksand', sans-serif",
    }}>
      {/* 左侧：故事展示 */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderRight: "2px solid #E6E6FA",
        background: "rgba(255,255,255,0.85)",
        padding: "2rem 1.5rem",
      }}>
        <h1 style={{ color: "#6A5ACD", marginBottom: "1rem" }}>📖 你的疗愈故事 ✨</h1>
        <div style={{
          width: "100%",
          maxWidth: "520px",
          minHeight: "350px",
          background: "rgba(255,255,255,0.97)",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          marginBottom: "1rem",
          animation: "fadeIn 1s ease-in-out",
          overflowY: "auto"
        }}>
          {narrative ? (
            <pre style={{
              color: "#555",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "'Quicksand', sans-serif",
              textAlign: "left",
              margin: 0
            }}>
              {narrative}
            </pre>
          ) : (
            <p style={{ color: "#999" }}>🌙 正在生成你的故事……请稍等 🌸</p>
          )}
        </div>
      </div>
      {/* 右侧：反思多轮对话 */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(245,245,255,0.8)",
        padding: "2rem 1.5rem"
      }}>
        {/* Instruction */}
        <div style={{
          width: "100%",
          maxWidth: "520px",
          background: "rgba(255,255,255,0.97)",
          borderRadius: "12px",
          padding: "0.75rem 1.2rem",
          marginBottom: "1rem",
          boxShadow: "0px 2px 6px rgba(0,0,0,0.04)",
          color: "#6A5ACD",
          fontWeight: 500,
          fontSize: "1.05rem"
        }}>
          你需要与AI反思交互至少 <strong style={{ color: "#FF69B4" }}>{MIN_REFLECTIONS}</strong> 次才能完成体验。<br />
          当前已完成：<strong>{userReflectionCount}</strong> 次，还需<strong>{remaining}</strong>次。
        </div>
        <h1 style={{ color: "#6A5ACD", marginBottom: "1rem" }}>🌿 情感反思 💭</h1>
        <div style={{
          width: "100%",
          maxWidth: "520px",
          background: "rgba(255,255,255,0.97)",
          borderRadius: "16px",
          padding: "1.5rem",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
          marginBottom: "1rem",
          animation: "fadeIn 1s ease-in-out",
          minHeight: "320px",
          maxHeight: "430px",
          overflowY: "auto"
        }}>
          {reflectionHistory.length === 0 && (
            <div style={{ color: "#999", marginBottom: "1rem" }}>请在下方输入你的感受，与AI聊聊你的共鸣和思考。</div>
          )}
          {reflectionHistory.map((msg, idx) => (
            <div key={idx} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.sender === "用户" ? "flex-end" : "flex-start",
              marginBottom: "0.5rem",
            }}>
              <pre style={{
                background: msg.sender === "用户" ? "#FFB6C1" : "#E6E6FA",
                padding: "8px 12px",
                borderRadius: "12px",
                maxWidth: "80%",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: "'Quicksand', sans-serif",
                lineHeight: "1.5",
                margin: 0,
                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.08)",
              }}>
                <strong>{msg.sender}:</strong> {msg.text}
              </pre>
            </div>
          ))}
          {isReflecting && (
            <div style={{
              color: "#6A5ACD",
              fontStyle: "italic",
              margin: "8px 0 0 0",
            }}>AI正在思考中...</div>
          )}
        </div>
        <div style={{
          marginTop: "1rem",
          display: "flex",
          alignItems: "center",
          width: "100%",
          maxWidth: "520px",
        }}>
          <input
            type="text"
            value={reflectionInput}
            onChange={(e) => setReflectionInput(e.target.value)}
            placeholder="请分享你的感受..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "12px",
              border: "1px solid #ddd",
              boxShadow: "inset 0px 2px 4px rgba(0, 0, 0, 0.1)",
            }}
            onKeyDown={e => {
              if (e.key === "Enter") handleSendReflection();
            }}
            disabled={isReflecting}
          />
          <button onClick={handleSendReflection} style={{
            marginLeft: "1rem",
            padding: "10px 16px",
            borderRadius: "12px",
            border: "none",
            background: "#6A5ACD",
            color: "#fff",
            cursor: isReflecting ? "not-allowed" : "pointer",
            opacity: isReflecting ? 0.7 : 1,
            transition: "background 0.3s",
          }}
            disabled={isReflecting}
          >
            发送
          </button>
        </div>
{remaining === 0 && !code && (
        <button
          style={{
            marginTop: "1.5rem",
            padding: "14px 28px",
            borderRadius: "14px",
            background: "#28b76b",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1.1rem",
            border: "none",
            cursor: gettingCode ? "not-allowed" : "pointer",
            opacity: gettingCode ? 0.7 : 1,
            transition: "background 0.3s",
          }}
          disabled={gettingCode}
          onClick={async () => {
            setGettingCode(true);
            try {
              // Call backend to end session/cleanup
              await fetch(`${API_URL}/api/end_session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: sessionId }),
              });
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
        <div style={{
          marginTop: "2rem",
          padding: "18px 24px",
          background: "#fffbe5",
          border: "2px dashed #28b76b",
          color: "#1d6434",
          fontSize: "1.15rem",
          fontWeight: 700,
          borderRadius: "14px",
          textAlign: "center",
          letterSpacing: "2px"
        }}>
          你的兑换码：<span style={{ fontWeight: 900 }}>{code}</span>
        </div>
      )}
      </div>
    </div>
  );
};

export default StoryReflectionPage;
