import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content: "Hello! I'm your AI Supply Chain Assistant. I can help you with shipment tracking, route optimization, risk analysis, and cost predictions. What would you like to know?",
    timestamp: new Date(),
  },
];

const suggestedQuestions = [
  "What's the status of my highest priority shipments?",
  "Which routes are currently experiencing delays?",
  "Show me cost optimization opportunities",
  "What are the current risk alerts?",
  "Predict delivery time for shipment SH-2026-001",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();

    if (lower.includes("status") || lower.includes("shipment")) {
      return "Based on current data, you have 1,284 active shipments. 95.3% are on-time, with 7 high-priority alerts. Shipment SH-2026-002 is experiencing delays due to highway construction in Philadelphia. Would you like me to suggest alternative routes?";
    }

    if (lower.includes("delay") || lower.includes("route")) {
      return "Currently, 3 routes are experiencing delays:\n\n1. Northeast corridor: Heavy snowstorm (6-8 hour delay)\n2. I-95 Philadelphia: Construction (4 hour delay)\n3. San Francisco-Sacramento: Fog advisory (1-2 hour delay)\n\nI recommend rerouting affected shipments via southern and alternative corridors to minimize impact.";
    }

    if (lower.includes("cost") || lower.includes("optim")) {
      return "I've identified several cost optimization opportunities:\n\n✓ Chicago-Denver corridor: Potential savings of $1,200/week\n✓ Carrier consolidation: Combine 5 LTL shipments for 18% reduction\n✓ Route efficiency: AI-optimized routes saving $24,500 this month\n\nWould you like me to apply these optimizations automatically?";
    }

    if (lower.includes("risk") || lower.includes("alert")) {
      return "Current risk analysis shows:\n\n🔴 Critical: Port strike warning (45 shipments affected)\n🟠 High: Northeast snowstorm (23 shipments)\n🟡 Medium: Fuel price spike in midwest (34 shipments)\n\nAI recommendation: Expedite inbound shipments and consider alternative ports for new bookings.";
    }

    if (lower.includes("predict") || lower.includes("sh-2026-001")) {
      return "Shipment SH-2026-001 analysis:\n\n📦 Current location: Kansas City, MO\n📍 Progress: 65% complete\n⏰ Original ETA: Apr 25, 3:00 PM\n🤖 AI-predicted ETA: Apr 25, 2:45 PM (15 min early)\n✅ Confidence: 92%\n\nNo significant risks detected. Weather and traffic conditions are favorable.";
    }

    if (lower.includes("weather")) {
      return "Weather impact analysis for next 48 hours:\n\n• Northeast: Heavy snow expected (high impact)\n• West Coast: Fog clearing by evening (low impact)\n• Midwest: Clear conditions (no impact)\n• Southeast: Scattered rain (moderate impact)\n\n12 shipments require rerouting. Shall I update the routes?";
    }

    return "I can help you with:\n\n• Real-time shipment tracking and status\n• Route optimization and cost analysis\n• Risk detection and mitigation strategies\n• Delay predictions and ETA estimates\n• Carrier performance analysis\n• Weather and traffic impact assessment\n\nPlease let me know what information you need!";
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
        content: generateResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          AI Supply Chain Assistant
        </h1>
        <p className="text-gray-600">Intelligent insights powered by machine learning</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              Chat with AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4" ref={scrollRef}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-indigo-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === "user" ? "text-indigo-200" : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
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

            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything about your supply chain..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend} disabled={!input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(question)}
                    className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></div>
                  <p>Real-time shipment status and tracking</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></div>
                  <p>Predictive delay detection using ML models</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></div>
                  <p>Cost optimization recommendations</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></div>
                  <p>Weather and traffic impact analysis</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></div>
                  <p>Route optimization with A* algorithm</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></div>
                  <p>Geopolitical risk monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                Generate Analytics Report
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Export Chat History
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Schedule AI Analysis
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
