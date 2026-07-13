/**
 * Netlify Function — API Gateway
 *
 * Netlify's own esbuild bundles this TypeScript file, resolving all workspace
 * packages via pnpm symlinks.  We import app-serverless (no pino workers,
 * pdfkit lazy-loaded) so the cold-start is clean.
 */

import serverlessHttp from "serverless-http";
import app from "../../artifacts/api-server/src/app-serverless.js";

const serverless = serverlessHttp(app, {
  binary: ["application/pdf", "application/octet-stream", "image/*"],
});

export const handler = async (event: any, context: any) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return serverless(event, context);
};
