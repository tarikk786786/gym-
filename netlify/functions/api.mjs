/**
 * Netlify Function — API Gateway
 *
 * Imports the pre-built Express app (no pino workers, no TypeScript resolution
 * needed) and wraps it with serverless-http so every /api/* request is handled
 * by the existing Express routes unchanged.
 *
 * Pre-built by: pnpm --filter @workspace/api-server run build
 * Output:       artifacts/api-server/dist/handler.mjs
 */

import serverlessHttp from "serverless-http";
import app from "../../artifacts/api-server/dist/handler.mjs";

// Binary content-types that must be base64-encoded in the Lambda response.
const serverless = serverlessHttp(app, {
  binary: ["application/pdf", "application/octet-stream", "image/*"],
});

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return serverless(event, context);
};
