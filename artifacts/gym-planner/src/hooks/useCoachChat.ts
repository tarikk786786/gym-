import { useState, useCallback, useRef } from 'react';

type Message = { role: 'user' | 'assistant'; content: string; id: string };

export function useCoachChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userText: string) => {
    const userMsg: Message = { role: 'user', content: userText, id: crypto.randomUUID() };
    const assistantId = crypto.randomUUID();
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', id: assistantId }]);
    setIsStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

    try {
      const resp = await fetch(`${basePath}/api/coach/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
        signal: ctrl.signal,
      });

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + data.text } : m));
            }
            if (data.done || data.error) setIsStreaming(false);
          } catch {}
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Sorry, something went wrong. Please try again.' } : m));
      }
    } finally {
      setIsStreaming(false);
    }
  }, [messages]);

  const clear = useCallback(() => setMessages([]), []);
  const abort = useCallback(() => abortRef.current?.abort(), []);

  return { messages, isStreaming, sendMessage, clear, abort };
}