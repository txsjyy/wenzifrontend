"use client"
// context/ChatContext.tsx
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
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [narrative, setNarrative] = useState<string>("");
  const [reflection, setReflection] = useState<string>("");

  return (
    <ChatContext.Provider value={{
      chatHistory, setChatHistory,
      narrative, setNarrative,
      reflection, setReflection,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
