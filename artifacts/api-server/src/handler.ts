/**
 * Netlify / serverless entry-point.
 *
 * Exports the Express app instance without calling app.listen() so it can
 * be wrapped by serverless-http in the Netlify Function.  The regular
 * server entry-point (src/index.ts) calls listen() and is used only for
 * the long-running Replit / Docker process.
 */
export { default } from "./app.js";
