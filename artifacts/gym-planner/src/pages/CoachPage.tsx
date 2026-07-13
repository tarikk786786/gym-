import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { useCoachChat } from "@/hooks/useCoachChat";
import { Send, Bot, Trash2, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTIONS = [
  "Create a workout for tomorrow",
  "Review my recent progress",
  "What should I eat for muscle gain?",
  "I'm feeling fatigued — am I overtraining?",
];

/** Renders markdown-like text safely as React elements — no HTML injection. */
function SafeMarkdown({ text }: { text: string }) {
  // Split on double-newlines for paragraphs, then handle inline formatting
  const segments = text.split("\n");
  return (
    <span className="whitespace-pre-wrap leading-relaxed">
      {segments.map((line, i) => (
        <span key={i}>
          {renderInline(line)}
          {i < segments.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
}

function renderInline(line: string): React.ReactNode[] {
  // Pattern: **bold**, *italic*, `code`
  const pattern = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const parts = line.split(pattern);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={i} className="bg-white/10 px-1 py-0.5 rounded text-primary text-sm font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function CoachPage() {
  const { messages, isStreaming, sendMessage, clear } = useCoachChat();
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const SpeechRecognition =
    typeof window !== "undefined" &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

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

  const toggleVoice = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.start();
      setIsRecording(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + " " + transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-6 px-4 md:px-6 flex flex-col h-[100dvh]">
        <div className="container mx-auto max-w-4xl flex flex-col h-full bg-black/40 border border-white/10 rounded-[1.5rem] overflow-hidden glass-panel">
          
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 bg-black/60">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold text-white">AI Coach</h1>
                <p className="text-sm text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Online and ready
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear
              </Button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
                <Bot className="w-16 h-16 text-white/20 mb-6" />
                <h2 className="text-2xl font-display font-bold text-white mb-2 text-center">How can I help you today?</h2>
                <p className="text-muted-foreground text-center mb-10">Ask any question about your workouts, nutrition, or progress.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(suggestion)}
                      className="glass-panel p-4 text-left rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-gray-300 hover:text-white group border border-white/10"
                    >
                      <div className="flex justify-between items-center">
                        <span>{suggestion}</span>
                        <Send className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl ${
                      m.role === "user"
                        ? "bg-primary text-black rounded-tr-none font-medium"
                        : "glass-panel text-white rounded-tl-none border border-white/10 leading-relaxed"
                    }`}
                  >
                    {m.role === "user" ? (
                      m.content
                    ) : (
                      <SafeMarkdown text={m.content} />
                    )}
                  </div>
                </div>
              ))
            )}
            
            {isStreaming && (
              <div className="flex justify-start">
                <div className="glass-panel text-white rounded-3xl rounded-tl-none border border-white/10 p-4 flex gap-1.5 items-center h-[56px]">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.1s]" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.2s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Input Area */}
          <div className="p-4 sm:p-6 bg-black/60 border-t border-white/10">
            <div className="relative flex items-end gap-2 max-w-4xl mx-auto">
              <div className="relative flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message AI Coach..."
                  className="w-full resize-none min-h-[56px] max-h-[200px] bg-white/5 border-white/10 text-white rounded-2xl pl-4 pr-12 py-4 focus-visible:ring-1 focus-visible:ring-primary/50"
                  rows={1}
                />
                {recognition && (
                  <button
                    onClick={toggleVoice}
                    className={`absolute right-3 bottom-3 p-2 rounded-xl transition-colors ${
                      isRecording ? "text-red-500 bg-red-500/10 animate-pulse" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="h-[56px] px-6 rounded-2xl bg-primary text-black font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="text-center mt-2 text-xs text-muted-foreground">
              AI Coach can make mistakes. Consider verifying important information.
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
