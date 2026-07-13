import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { MessageSquare, X, Send, Bot, User, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCoachChat } from "@/hooks/useCoachChat";

export function CoachWidget() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isStreaming, sendMessage } = useCoachChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Do not render on the full coach page
  if (location === "/coach") return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isStreaming]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-50 group border-2 border-primary/50"
        >
          <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />
        </button>
      )}

      {/* Mini Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[340px] h-[500px] max-h-[80vh] glass-panel rounded-2xl flex flex-col z-50 overflow-hidden shadow-2xl border border-white/10 animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-black font-bold text-xs">
                AI
              </div>
              <span className="font-display font-bold text-white">AI Coach</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-70">
                <Bot className="w-12 h-12 text-primary" />
                <p className="text-sm text-gray-300">Hey! I'm your AI Coach. Ask me anything about your fitness journey.</p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      m.role === "user"
                        ? "bg-primary text-black rounded-tr-none font-medium"
                        : "glass-panel text-white rounded-tl-none border border-white/10"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {isStreaming && (
              <div className="flex justify-start">
                <div className="glass-panel text-white rounded-2xl rounded-tl-none border border-white/10 p-3 flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.1s]" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.2s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-black/40 border-t border-white/10">
            <div className="flex items-end gap-2 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coach..."
                className="resize-none min-h-[44px] h-[44px] max-h-[120px] bg-white/5 border-white/10 rounded-xl pr-12 text-sm text-white focus-visible:ring-1 focus-visible:ring-primary/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-primary text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
