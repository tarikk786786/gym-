import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Lazy initialisation — the module loads cleanly even without DATABASE_URL.
// The first DB call will throw a clear error if the env var is missing,
// rather than crashing the serverless function at cold-start.
function getPool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  return new Pool({ connectionString: process.env.DATABASE_URL });
}

let _pool: pg.Pool | undefined;
let _db: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (!_db) {
    _pool = getPool();
    _db = drizzle(_pool, { schema });
  }
  return _db;
}

// Keep the named exports so existing imports continue to work.
// pool / db are Proxy objects that initialise on first property access.
export const pool = new Proxy({} as pg.Pool, {
  get(_t, prop) {
    if (!_pool) _pool = getPool();
    return (_pool as any)[prop];
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_t, prop) {
    return (getDb() as any)[prop];
  },
});

export * from "./schema";
