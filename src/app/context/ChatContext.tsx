"use client";
import { createContext, useState, ReactNode } from "react";

export type ChatMessage = {
  sender: string;
  text: string;
};

interface ChatContextType {
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  narrative: string;
  setNarrative: (narrative: string) => void;
  reflection: string;
  setReflection: (reflection: string) => void;
  sessionId: string;
  setSessionId: (id: string) => void;
  resetAll: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

function uuidv4(): string {
  if (typeof window !== "undefined" && typeof crypto !== "undefined" && crypto.getRandomValues) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 0xf) >> 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  } else {
    // fallback if crypto.getRandomValues is not available
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [narrative, setNarrative] = useState<string>("");
  const [reflection, setReflection] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>(() => {
    // Try to load from localStorage
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("session_id");
      if (existing) return existing;
      // Generate new if not found
      const uuid = uuidv4();
      localStorage.setItem("session_id", uuid);
      return uuid;
    }
    return "";
  });

  const resetAll = () => {
    setChatHistory([]);
    setNarrative("");
    setReflection("");
    setSessionId(() => {
      const uuid = uuidv4();
      localStorage.setItem("session_id", uuid);
      return uuid;
    });
  };

  return (
    <ChatContext.Provider value={{
      chatHistory, setChatHistory,
      narrative, setNarrative,
      reflection, setReflection,
      sessionId, setSessionId,
      resetAll,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
