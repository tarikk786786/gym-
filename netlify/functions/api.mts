/**
 * Netlify Function — API Gateway
 *
 * Wraps the existing Express application with serverless-http so the same
 * server code runs both on Replit (long-running process) and Netlify
 * (serverless invocations).  No changes to Express routes are required.
 *
 * Request path flow:
 *   Browser: GET /api/profile
 *   → netlify.toml redirect (status=200 rewrite)
 *   → /.netlify/functions/api/profile
 *   → Netlify invokes this handler with event.path = "/api/profile"
 *   → serverless-http translates to an Express IncomingMessage
 *   → Express router matches GET /api/profile → responds
 *   → serverless-http serialises response back to Netlify event format
 */

import serverlessHttp from "serverless-http";
// Import the Express app instance (not the server entry-point that calls
// app.listen — that file is src/index.ts).
import app from "../../artifacts/api-server/src/app.js";

// Build the serverless adapter once (module-level, survives warm invocations).
// binary: tell serverless-http which Content-Types to base64-encode so that
// PDF downloads arrive at the browser intact.
const serverless = serverlessHttp(app as any, {
  binary: [
    "application/pdf",
    "application/octet-stream",
    "image/*",
  ],
});

/**
 * Netlify Function handler — ESM default export style.
 *
 * Netlify passes:
 *   event.path                      — original request URL path (before rewrite)
 *   event.httpMethod                — GET / POST / etc.
 *   event.headers                   — request headers
 *   event.queryStringParameters     — parsed query string
 *   event.body                      — request body (string or null)
 *   event.isBase64Encoded           — whether body is base64 encoded
 */
export const handler = async (event: any, context: any) => {
  // Make Lambda/Netlify context available inside middlewares if needed.
  context.callbackWaitsForEmptyEventLoop = false;

  return serverless(event, context);
};
