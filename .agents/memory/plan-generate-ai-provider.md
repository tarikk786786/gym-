---
name: Plan generate AI provider
description: Which AI provider powers the /plan/generate endpoint and why it changed
---

The `/plan/generate` endpoint in `artifacts/api-server/src/routes/plan/index.ts` uses **Gemini 2.5 Flash** via `@workspace/integrations-gemini-ai`.

**Why:** The original Task #6 implementation used NVIDIA NIM (`meta/llama-3.1-405b-instruct`) which required an `NVIDIA_API_KEY` secret that was never set. The endpoint would always throw on startup. Switched to Gemini (same provider used by all other AI endpoints in the project).

**How to apply:** If anyone adds an NVIDIA-based route again, it needs `NVIDIA_API_KEY` in Replit Secrets. For new AI plan routes, use the same Gemini pattern as `generators.ts` and `coach.ts`.
