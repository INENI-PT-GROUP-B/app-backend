import Fastify, { type FastifyInstance } from "fastify";

import { healthRoutes } from "./routes/health.js";
import { propertyRoutes } from "./routes/properties.js";

export const buildApp = (options: { logger?: boolean } = {}): FastifyInstance => {
  const app = Fastify({ logger: options.logger ?? true });

  app.register(healthRoutes);
  app.register(propertyRoutes, { prefix: "/api/properties" });

  return app;
};
