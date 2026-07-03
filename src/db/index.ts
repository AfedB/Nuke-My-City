import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Runtime : passe par le pooler PgBouncer du VPS (DATABASE_URL, TLS).
// Une seule Pool réutilisée entre invocations (hot-reload dev + serverless).
const globalForDb = globalThis as unknown as { _pgPool?: Pool };

const pool =
  globalForDb._pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

if (process.env.NODE_ENV !== "production") globalForDb._pgPool = pool;

export const db = drizzle(pool, { schema });
export { schema };
