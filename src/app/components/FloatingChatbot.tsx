import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Bot, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickReplies = [
  "Track shipment",
  "Delay alerts",
  "Cost analysis",
  "Route suggestions",
];

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI assistant. Ask me about shipments, routes, or delays.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateQuickResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();

    if (lower.includes("track")) {
      return "I can help you track shipments. You have 1,284 active shipments. Would you like to see high-priority ones?";
    }
    if (lower.includes("delay")) {
      return "Currently 3 routes have delays: Northeast snowstorm (6-8h), I-95 construction (4h), and SF fog (1-2h). Need details?";
    }
    if (lower.includes("cost")) {
      return "Cost savings this month: $24,500. I found opportunities in Chicago-Denver corridor ($1,200/week) and carrier consolidation (18% reduction).";
    }
    if (lower.includes("route")) {
      return "I recommend the AI-optimized route for LA-NYC: 2,789 mi, $3,590 cost, saving $850 vs standard route. Apply it?";
    }

    return "I can help with shipment tracking, route optimization, delay alerts, and cost analysis. What do you need?";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateQuickResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Bot className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0, originX: 1, originY: 1 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl border z-50 transition-all ${
        isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b bg-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-medium">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:bg-indigo-700 h-8 w-8"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-indigo-700 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <ScrollArea className="h-[440px] p-4">
            <div className="space-y-4" ref={scrollRef}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg p-3 text-sm ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t space-y-2">
            <div className="flex gap-2 flex-wrap">
              {quickReplies.map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="text-sm"
              />
              <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
