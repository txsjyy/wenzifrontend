// "use client";

// import { useState, useEffect, useContext, FC } from "react";
// import { ChatContext, ChatMessage } from "../context/ChatContext";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// const SingleChatPage: FC = () => {
//   const { chatHistory, setChatHistory } = useContext(ChatContext)!;
//   const [input, setInput] = useState<string>("");

//   // 页面加载时获取欢迎语（POST方式）
//   useEffect(() => {
//     // 你可以自定义input，比如“你好”或空字符串等
//     fetch(`${API_URL}/api/pure_gpt4o_chat`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ input: "请用中文欢迎用户并简单介绍你的身份和功能。" }),
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         setChatHistory([{ sender: "系统", text: data.response || data.message }]);
//       })
//       .catch((err) => console.error("获取欢迎语时出错：", err));
//   }, [setChatHistory]);

//   // 发送聊天消息
//   const sendChat = async () => {
//     if (!input.trim()) return;
//     setChatHistory((prev: ChatMessage[]) => [...prev, { sender: "用户", text: input }]);
//     try {
//       const res = await fetch(`${API_URL}/api/pure_gpt4o_chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ input }),
//       });
//       const data = await res.json();
//       setChatHistory((prev: ChatMessage[]) => [...prev, { sender: "AI", text: data.response }]);
//     } catch (error) {
//       setChatHistory((prev: ChatMessage[]) => [
//         ...prev,
//         { sender: "系统", text: "⚠️ 发送失败，请稍后重试。" },
//       ]);
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
//       <h1 style={{ color: "#6A5ACD", marginBottom: "1rem" }}>🌿 AI 心理疗愈对话 🌸</h1>
//       <div style={{
//         width: "96%",
//         maxWidth: "800px",
//         background: "rgba(255, 255, 255, 0.95)",
//         borderRadius: "24px",
//         padding: "1.5rem",
//         boxShadow: "0px 6px 16px rgba(0,0,0,0.13)",
//         overflowY: "auto",
//         height: "650px",
//         marginBottom: "1rem",
//       }}>
//         {chatHistory.map((msg, idx) => (
//           <div key={idx} style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: msg.sender === "用户" ? "flex-end" : "flex-start",
//             marginBottom: "0.5rem",
//           }}>
//             <pre style={{
//               background: msg.sender === "用户" ? "#FFB6C1" : "#E6E6FA",
//               padding: "8px 12px",
//               borderRadius: "12px",
//               maxWidth: "80%",
//               whiteSpace: "pre-wrap",
//               wordBreak: "break-word",
//               fontFamily: "'Quicksand', sans-serif",
//               lineHeight: "1.5",
//               margin: 0,
//               boxShadow: "0px 2px 5px rgba(0,0,0,0.10)",
//             }}>
//               <strong>{msg.sender}:</strong> {msg.text}
//             </pre>
//           </div>
//         ))}
//       </div>
//       <div style={{
//         marginTop: "1rem",
//         display: "flex",
//         alignItems: "center",
//         width: "96%",
//         maxWidth: "800px",
//       }}>
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="请输入消息..."
//           style={{
//             flex: 1,
//             padding: "14px",
//             borderRadius: "14px",
//             border: "1px solid #ddd",
//             fontSize: "1rem",
//             boxShadow: "inset 0px 2px 4px rgba(0,0,0,0.10)",
//           }}
//           onKeyDown={e => {
//             if (e.key === "Enter") sendChat();
//           }}
//         />
//         <button onClick={sendChat} style={{
//           marginLeft: "1rem",
//           padding: "12px 22px",
//           borderRadius: "14px",
//           border: "none",
//           background: "#6A5ACD",
//           color: "#fff",
//           fontWeight: 600,
//           fontSize: "1.05rem",
//           cursor: "pointer",
//           transition: "background 0.3s",
//         }}>
//           发送
//         </button>
//       </div>
//     </div>
//   );
// };

// export default SingleChatPage;
"use client";

import { useState, useEffect, useContext, FC } from "react";
import { ChatContext, ChatMessage } from "../context/ChatContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const SingleChatPage: FC = () => {
  const { chatHistory, setChatHistory } = useContext(ChatContext)!;
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // 页面加载时获取欢迎语（POST方式）
  useEffect(() => {
    fetch(`${API_URL}/api/pure_gpt4o_chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "请用中文欢迎用户并简单介绍你的身份和功能。" }),
    })
      .then((res) => res.json())
      .then((data) => {
        setChatHistory([{ sender: "系统", text: data.response || data.message }]);
      })
      .catch((err) => console.error("获取欢迎语时出错：", err));
    // eslint-disable-next-line
  }, [setChatHistory]);

  // 发送聊天消息
  const sendChat = async () => {
    if (!input.trim()) return;
    setChatHistory((prev: ChatMessage[]) => [...prev, { sender: "用户", text: input }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/pure_gpt4o_chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setChatHistory((prev: ChatMessage[]) => [
        ...prev,
        { sender: "AI", text: data.response || data.error || "⚠️ 未获取到AI回复。" },
      ]);
    } catch (error) {
      setChatHistory((prev: ChatMessage[]) => [
        ...prev,
        { sender: "系统", text: "⚠️ 发送失败，请稍后重试。" },
      ]);
      console.error("发送消息时出错：", error);
    }
    setInput("");
    setLoading(false);
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
      <h1 style={{ color: "#6A5ACD", marginBottom: "1rem" }}>🌿 AI 心理疗愈对话 🌸</h1>
      <div style={{
        width: "96%",
        maxWidth: "800px",
        background: "rgba(255, 255, 255, 0.95)",
        borderRadius: "24px",
        padding: "1.5rem",
        boxShadow: "0px 6px 16px rgba(0,0,0,0.13)",
        overflowY: "auto",
        height: "650px",
        marginBottom: "1rem",
      }}>
        {chatHistory.map((msg, idx) => (
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
              boxShadow: "0px 2px 5px rgba(0,0,0,0.10)",
            }}>
              <strong>{msg.sender}:</strong> {msg.text}
            </pre>
          </div>
        ))}
        {loading && (
          <div style={{ color: "#6A5ACD", margin: "1rem 0" }}>AI正在回复中...</div>
        )}
      </div>
      <div style={{
        marginTop: "1rem",
        display: "flex",
        alignItems: "center",
        width: "96%",
        maxWidth: "800px",
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入消息..."
          style={{
            flex: 1,
            padding: "14px",
            borderRadius: "14px",
            border: "1px solid #ddd",
            fontSize: "1rem",
            boxShadow: "inset 0px 2px 4px rgba(0,0,0,0.10)",
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && !loading) sendChat();
          }}
          disabled={loading}
        />
        <button onClick={sendChat} style={{
          marginLeft: "1rem",
          padding: "12px 22px",
          borderRadius: "14px",
          border: "none",
          background: "#6A5ACD",
          color: "#fff",
          fontWeight: 600,
          fontSize: "1.05rem",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "background 0.3s",
        }} disabled={loading}>
          发送
        </button>
      </div>
    </div>
  );
};

export default SingleChatPage;
