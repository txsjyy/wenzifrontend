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
  designAdvice: string;
  setDesignAdvice: (advice: string) => void;
  preferences: {
    story_type: string;
    mode: string;
    style: string;
  };
  setPreferences: (prefs: { story_type: string; mode: string; style: string; }) => void;
  narrative: string;
  setNarrative: (narrative: string) => void;
  reflection: string;
  setReflection: (reflection: string) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [designAdvice, setDesignAdvice] = useState<string>("");
  const [preferences, setPreferences] = useState<{ story_type: string; mode: string; style: string; }>({
    story_type: "",
    mode: "",
    style: "",
  });
  const [narrative, setNarrative] = useState<string>("");
  const [reflection, setReflection] = useState<string>("");

  return (
    <ChatContext.Provider value={{
      chatHistory, setChatHistory,
      designAdvice, setDesignAdvice,
      preferences, setPreferences,
      narrative, setNarrative,
      reflection, setReflection,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
