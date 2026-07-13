# Deploying to Netlify

This guide covers everything needed to deploy the **Tarik Islam AI Gym Planner** to Netlify — a static frontend on the CDN plus the Express API running as a Netlify Function.

---

## Architecture on Netlify

```
Browser
  │
  ├── /*, /dashboard, /blog/* …  →  Static React SPA  (Netlify CDN)
  │
  └── /api/*                     →  Netlify Function   (serverless Express)
        │
        ├── /api/profile         →  Express router
        ├── /api/plan/generate   →  NVIDIA NIM AI
        ├── /api/coach/chat      →  Gemini AI streaming
        ├── /api/reports/…       →  PDFKit PDF generator
        └── /api/__clerk/…       →  Clerk FAPI proxy
```

---

## 1 · Connect the Repository

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Connect to GitHub and select `tarikk786786786/gym-`
3. Netlify auto-detects `netlify.toml` — confirm the settings:
   - **Build command**: `pnpm install --frozen-lockfile=false && pnpm run netlify:build`
   - **Publish directory**: `artifacts/gym-planner/dist/public`
   - **Functions directory**: `netlify/functions`

---

## 2 · Environment Variables

Set all of these in **Netlify → Site → Environment variables** before the first deploy.

### Required — Auth (Clerk)

| Variable | Value | Note |
|---|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_live_…` | Publishable key from Clerk dashboard |
| `CLERK_PUBLISHABLE_KEY` | same as above | Used by the API function at runtime |
| `CLERK_SECRET_KEY` | `sk_live_…` | Secret key — never expose this client-side |
| `VITE_CLERK_PROXY_URL` | `https://YOUR-SITE.netlify.app/api/__clerk` | Enables auth on custom domains |

> **Where to get Clerk keys**: Your Replit-managed Clerk instance keys are already in Replit Secrets (`CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`). Copy the same values to Netlify.

### Required — Database

| Variable | Value |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@host/db?sslmode=require` |

> **Recommended DB**: [Neon](https://neon.tech) (serverless-friendly Postgres, free tier). Create a project, copy the connection string.

### Required — AI

| Variable | Value |
|---|---|
| `NVIDIA_API_KEY` | Your NVIDIA API key for `meta/llama-3.1-405b-instruct` plan generation |
| `GEMINI_API_KEY` | Your Gemini API key for the AI coach |
| `AI_INTEGRATIONS_GEMINI_API_KEY` | Same as `GEMINI_API_KEY` (used by the Gemini integration package) |
| `AI_INTEGRATIONS_GEMINI_BASE_URL` | Leave blank if using public Gemini API |

### Required — Session

| Variable | Value |
|---|---|
| `SESSION_SECRET` | Any long random string, e.g. `openssl rand -hex 32` |

### Auto-set by `netlify.toml` (no action needed)

| Variable | Value |
|---|---|
| `BASE_PATH` | `/` |
| `PORT` | `8888` |
| `NODE_VERSION` | `20` |

---

## 3 · Push Database Schema

After setting `DATABASE_URL`, run the schema migration once from your local machine or Replit:

```bash
DATABASE_URL="postgresql://..." pnpm --filter @workspace/db run push
```

---

## 4 · Deploy

Trigger a deploy manually or push a commit to `main`. Watch the build log — it should:

1. Install pnpm v9 via corepack
2. Install all workspace dependencies
3. Build the React SPA → `artifacts/gym-planner/dist/public`
4. Bundle the Netlify Function at `netlify/functions/api.mts`

---

## 5 · Post-Deploy Checklist

- [ ] Visit `https://YOUR-SITE.netlify.app` — landing/planner page loads
- [ ] Sign up / sign in via Clerk
- [ ] Dashboard loads and profile API responds
- [ ] AI Workout Generator produces a plan
- [ ] AI Diet Planner produces a meal plan
- [ ] PDF Report downloads correctly
- [ ] AI Coach responds in the chat

---

## Troubleshooting

### Function timeout on plan generation
The NVIDIA API can take 15–25 seconds. The function timeout is set to 26 s (`netlify.toml`).  
Starter plan cap is 10 s — upgrade to **Pro** or switch the plan endpoint to Gemini (faster).

### PDF downloads are corrupted / empty
Ensure `pdfkit` is in the `external_node_modules` list in `netlify.toml` (already configured).  
PDFs must be base64-encoded in the function response — `serverless-http` handles this automatically for `Content-Type: application/pdf`.

### Clerk auth fails / redirect loop
- Confirm `VITE_CLERK_PROXY_URL` ends in `/api/__clerk` (no trailing slash).
- Confirm `VITE_CLERK_PUBLISHABLE_KEY` matches the live Clerk key (not the dev `pk_test_…` key).

### 502 / Function crashed on cold start
Check **Netlify → Functions → api → Recent invocations** for the actual error.  
Most common causes: missing env var (`DATABASE_URL`, `NVIDIA_API_KEY`), or DB connection refused.

### `pdfkit` font errors in function logs
Add `"pdfkit"` and `"fontkit"` to `external_node_modules` under `[functions."api"]` in `netlify.toml` (already configured).
