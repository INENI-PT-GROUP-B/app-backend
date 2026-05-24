import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// A property managed by a single landlord (the platform tenant). The renter of
// a property is referred to as a lessee/occupant elsewhere; this table holds
// no lessee data.
export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  street: text("street").notNull(),
  zip: text("zip").notNull(),
  city: text("city").notNull(),
  sizeSqm: numeric("size_sqm", { precision: 8, scale: 2 }).notNull(),
  rentEur: numeric("rent_eur", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
