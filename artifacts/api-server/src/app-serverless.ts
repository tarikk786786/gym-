/**
 * Serverless variant of the Express app.
 *
 * Identical to app.ts but replaces pinoHttp with a lightweight console logger
 * so no pino worker threads are spawned.  Worker threads don't survive the
 * short lifespan of a Netlify/Lambda invocation and cause esbuild warnings
 * about missing worker-bundle side-effects.
 */

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";

const app: Express = express();

// ── Lightweight request logger (no pino workers) ─────────────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  _res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`[api] ${req.method} ${req.url?.split("?")[0]} ${_res.statusCode} ${ms}ms`);
  });
  next();
});

// Clerk proxy must be mounted before body parsers (streams raw bytes)
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

export default app;
