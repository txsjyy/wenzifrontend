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


export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [narrative, setNarrative] = useState<string>("");
  const [reflection, setReflection] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>(""); 

  const resetAll = () => {
    setChatHistory([]);
    setNarrative("");
    setReflection("");
    setSessionId("");
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
