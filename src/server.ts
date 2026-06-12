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

// Kubernetes sends SIGTERM on every rolling update and eviction; without a
// handler Node exits immediately and drops in-flight requests. app.close()
// stops accepting new connections and waits for in-flight requests, then the
// pg pool is released. SIGINT covers local Ctrl-C. The guard keeps a repeated
// signal during shutdown from ending the pool twice (which would throw and
// turn a clean shutdown into a non-zero exit).
let shuttingDown = false;

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;
  app.log.info({ signal }, "shutting down");
  try {
    await app.close();
    await pool.end();
    process.exit(0);
  } catch (err) {
    app.log.error({ err }, "graceful shutdown failed");
    process.exit(1);
  }
};

process.on("SIGTERM", (signal) => void shutdown(signal));
process.on("SIGINT", (signal) => void shutdown(signal));

void start();
