import { buildApp } from "./app.js";
import { pool, runMigrations } from "./db/index.js";
import { setMigrationsComplete } from "./readiness.js";

const port = Number(process.env.PORT ?? 3000);

const app = buildApp();

const start = async (): Promise<void> => {
  try {
    // Run migrations before accepting requests; the readiness flag gates
    // /healthz until this completes.
    await runMigrations();
    setMigrationsComplete(true);

    // host 0.0.0.0 is required so the server is reachable from outside the
    // container / pod (Fastify defaults to 127.0.0.1).
    await app.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    app.log.error({ err }, "server failed to start");
    await pool.end().catch(() => undefined);
    process.exit(1);
  }
};

void start();
