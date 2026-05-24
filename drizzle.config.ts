import { defineConfig } from "drizzle-kit";

// The schema file is added in a later change; drizzle-kit only reads it when
// generating or applying migrations, neither of which runs in this skeleton.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
