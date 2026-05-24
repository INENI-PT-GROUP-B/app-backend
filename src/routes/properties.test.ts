import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "../app.js";
import { db, pool, runMigrations } from "../db/index.js";
import { properties } from "../db/schema.js";
import { setMigrationsComplete } from "../readiness.js";

const app = buildApp({ logger: false });

const sample = {
  label: "Flat 1",
  street: "Main Street 1",
  zip: "1010",
  city: "Vienna",
  sizeSqm: 55.5,
  rentEur: 900,
};

beforeAll(async () => {
  await runMigrations();
  setMigrationsComplete(true);
  await db.delete(properties);
  await app.ready();
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

describe("healthz", () => {
  it("returns 200 once migrations are complete", async () => {
    const res = await app.inject({ method: "GET", url: "/healthz" });
    expect(res.statusCode).toBe(200);
  });
});

describe("properties API", () => {
  it("rejects an incomplete POST body with 400", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/properties",
      payload: { label: "only a label" },
    });
    expect(res.statusCode).toBe(400);
  });

  it("rejects a malformed id with 400", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/properties/not-a-uuid",
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 404 for an unknown property", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/properties/00000000-0000-0000-0000-000000000000",
    });
    expect(res.statusCode).toBe(404);
  });

  it("creates, reads, updates and deletes a property", async () => {
    const created = await app.inject({
      method: "POST",
      url: "/api/properties",
      payload: sample,
    });
    expect(created.statusCode).toBe(201);
    const createdBody = created.json();
    expect(createdBody.id).toBeTypeOf("string");
    expect(createdBody.sizeSqm).toBe(55.5);
    expect(createdBody.rentEur).toBe(900);

    const id: string = createdBody.id;

    const fetched = await app.inject({
      method: "GET",
      url: `/api/properties/${id}`,
    });
    expect(fetched.statusCode).toBe(200);

    const listed = await app.inject({ method: "GET", url: "/api/properties" });
    expect(listed.statusCode).toBe(200);
    expect(listed.json()).toHaveLength(1);

    const patched = await app.inject({
      method: "PATCH",
      url: `/api/properties/${id}`,
      payload: { rentEur: 950 },
    });
    expect(patched.statusCode).toBe(200);
    expect(patched.json().rentEur).toBe(950);

    const deleted = await app.inject({
      method: "DELETE",
      url: `/api/properties/${id}`,
    });
    expect(deleted.statusCode).toBe(204);

    const gone = await app.inject({
      method: "GET",
      url: `/api/properties/${id}`,
    });
    expect(gone.statusCode).toBe(404);
  });
});
