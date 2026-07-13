import { GoogleGenAI } from "@google/genai";

// Lazy-initialize the client so the server can start without the key set.
// The key is validated when the client is first accessed.
let _ai: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
  if (_ai) return _ai;

  const apiKey =
    process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY must be set. Get a free key at https://aistudio.google.com",
    );
  }

  _ai = new GoogleGenAI({
    apiKey,
    ...(baseUrl ? { httpOptions: { apiVersion: "", baseUrl } } : {}),
  });

  return _ai;
}

// Keep backward-compat `ai` as a proxy object for existing code that does `ai.models.xxx`
export const ai = new Proxy({} as GoogleGenAI, {
  get(_target, prop) {
    return (getAI() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
