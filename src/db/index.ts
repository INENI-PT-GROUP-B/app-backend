import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import * as schema from "./schema.js";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

// Idempotent: drizzle records applied migrations in the __drizzle_migrations
// table and skips any that already ran.
export const runMigrations = async (): Promise<void> => {
  await migrate(db, { migrationsFolder: "./drizzle" });
};
