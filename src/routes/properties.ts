import { asc, eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";

import { db } from "../db/index.js";
import { properties, type NewProperty, type Property } from "../db/schema.js";

interface PropertyInput {
  label: string;
  street: string;
  zip: string;
  city: string;
  sizeSqm: number;
  rentEur: number;
  notes?: string | null;
}

type PropertyPatch = Partial<PropertyInput>;

interface IdParams {
  id: string;
}

const fieldProperties = {
  label: { type: "string", minLength: 1 },
  street: { type: "string", minLength: 1 },
  zip: { type: "string", minLength: 1 },
  city: { type: "string", minLength: 1 },
  sizeSqm: { type: "number", exclusiveMinimum: 0 },
  rentEur: { type: "number", minimum: 0 },
  notes: { type: ["string", "null"] },
};

const createBodySchema = {
  type: "object",
  additionalProperties: false,
  required: ["label", "street", "zip", "city", "sizeSqm", "rentEur"],
  properties: fieldProperties,
};

const patchBodySchema = {
  type: "object",
  additionalProperties: false,
  minProperties: 1,
  properties: fieldProperties,
};

const idParamsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id"],
  properties: {
    id: {
      type: "string",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
};

// numeric columns are represented as strings by Drizzle to preserve precision;
// the API exposes and accepts them as numbers.
const serialize = (row: Property) => ({
  id: row.id,
  label: row.label,
  street: row.street,
  zip: row.zip,
  city: row.city,
  sizeSqm: Number(row.sizeSqm),
  rentEur: Number(row.rentEur),
  notes: row.notes,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const propertyRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get("/", async () => {
    const rows = await db
      .select()
      .from(properties)
      .orderBy(asc(properties.createdAt));
    return rows.map(serialize);
  });

  app.post<{ Body: PropertyInput }>(
    "/",
    { schema: { body: createBodySchema } },
    async (request, reply) => {
      const body = request.body;
      const [row] = await db
        .insert(properties)
        .values({
          label: body.label,
          street: body.street,
          zip: body.zip,
          city: body.city,
          sizeSqm: String(body.sizeSqm),
          rentEur: String(body.rentEur),
          notes: body.notes ?? null,
        })
        .returning();
      return reply.code(201).send(serialize(row));
    },
  );

  app.get<{ Params: IdParams }>(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      const [row] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, request.params.id));
      if (!row) {
        return reply.code(404).send({ message: "Property not found" });
      }
      return serialize(row);
    },
  );

  app.patch<{ Params: IdParams; Body: PropertyPatch }>(
    "/:id",
    { schema: { params: idParamsSchema, body: patchBodySchema } },
    async (request, reply) => {
      const body = request.body;
      const patch: Partial<NewProperty> = {};
      if (body.label !== undefined) patch.label = body.label;
      if (body.street !== undefined) patch.street = body.street;
      if (body.zip !== undefined) patch.zip = body.zip;
      if (body.city !== undefined) patch.city = body.city;
      if (body.sizeSqm !== undefined) patch.sizeSqm = String(body.sizeSqm);
      if (body.rentEur !== undefined) patch.rentEur = String(body.rentEur);
      if (body.notes !== undefined) patch.notes = body.notes;

      const [row] = await db
        .update(properties)
        .set(patch)
        .where(eq(properties.id, request.params.id))
        .returning();
      if (!row) {
        return reply.code(404).send({ message: "Property not found" });
      }
      return serialize(row);
    },
  );

  app.delete<{ Params: IdParams }>(
    "/:id",
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      const [row] = await db
        .delete(properties)
        .where(eq(properties.id, request.params.id))
        .returning({ id: properties.id });
      if (!row) {
        return reply.code(404).send({ message: "Property not found" });
      }
      return reply.code(204).send();
    },
  );
};
