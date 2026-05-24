import { sql } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../db/index.js";
import { areMigrationsComplete } from "../readiness.js";

export const healthRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get("/healthz", async (_request, reply) => {
    if (!areMigrationsComplete()) {
      return reply.code(503).send({ status: "starting" });
    }

    try {
      await db.execute(sql`select 1`);
      return reply.code(200).send({ status: "ok" });
    } catch {
      return reply.code(503).send({ status: "unavailable" });
    }
  });
};
