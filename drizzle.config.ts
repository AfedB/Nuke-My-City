import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Les migrations DDL passent par la connexion DIRECTE (tunnel SSH vers le
// Postgres du VPS) — cf. OPS.md. DIRECT_URL est dans .env.local.
config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL!,
  },
});
