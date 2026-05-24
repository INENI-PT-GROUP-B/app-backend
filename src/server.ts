import Fastify from "fastify";

const port = Number(process.env.PORT ?? 3000);

const app = Fastify({
  logger: true,
});

// Placeholder route. Real routes (/healthz, /api/properties) follow in a
// later change.
app.get("/", async () => {
  return { service: "app-backend", status: "ok" };
});

const start = async (): Promise<void> => {
  try {
    // host 0.0.0.0 is required so the server is reachable from outside the
    // container / pod (Fastify defaults to 127.0.0.1).
    await app.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    app.log.error({ err }, "server failed to start");
    process.exit(1);
  }
};

void start();
