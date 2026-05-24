import { defineConfig } from "drizzle-kit";

// Used by drizzle-kit to generate SQL migrations from src/db/schema.ts into
// ./drizzle. Migrations are applied at runtime by runMigrations() in src/db.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
