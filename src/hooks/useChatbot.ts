/**
 * useChatbot — shared hook for chatbot interaction
 *
 * Encapsulates:
 *  - session_id (generated once via crypto.randomUUID)
 *  - message history (Message[])
 *  - isLoading / error state
 *  - sendMessage() action
 *
 * Both FloatingChatbot and AIAssistant import from here so all
 * API call logic lives in one place (src/lib/api.ts → chatbotAPI.ask).
 */

import { useState, useCallback } from "react";
import { chatbotAPI } from "../lib/api";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UseChatbotOptions {
  initialMessages?: Message[];
}

export function useChatbot(options: UseChatbotOptions = {}) {
  // Stable session id – generated once on component mount
  const [sessionId] = useState<string>(() => crypto.randomUUID());

  const [messages, setMessages] = useState<Message[]>(
    options.initialMessages ?? []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMessage: Message = {
        id: `${Date.now()}-user`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await chatbotAPI.ask(text, sessionId);

        const assistantMessage: Message = {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errMsg =
          err instanceof Error
            ? err.message
            : "Failed to get a response from the AI assistant.";

        setError(errMsg);
        console.error("[useChatbot] sendMessage error:", err);

        // Surface the failure as an in-chat message so the UI stays coherent
        const errorMessage: Message = {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId]
  );

  return { messages, isLoading, error, sendMessage, sessionId };
}
