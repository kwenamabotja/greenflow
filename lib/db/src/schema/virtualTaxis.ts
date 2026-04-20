import { pgTable, text, real, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const virtualTaxisTable = pgTable(
  "virtual_taxis",
  {
    id: text("id").primaryKey(),
    routeId: text("route_id").notNull(),
    routeName: text("route_name").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    passengerCount: integer("passenger_count").notNull(),
    destination: text("destination").notNull(),
    origin: text("origin").notNull(),
    estimatedArrivalMinutes: integer("estimated_arrival_minutes").notNull(),
    formedAt: timestamp("formed_at", { withTimezone: true }).notNull().defaultNow(),
    lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    routeIdIdx: index("idx_virtual_taxis_route_id").on(table.routeId),
    expiresAtIdx: index("idx_virtual_taxis_expires_at").on(table.expiresAt),
    formedAtIdx: index("idx_virtual_taxis_formed_at").on(table.formedAt),
  })
);

export const insertVirtualTaxiSchema = createInsertSchema(virtualTaxisTable).omit({
  id: true,
  formedAt: true,
  lastUpdated: true,
});
export type InsertVirtualTaxi = z.infer<typeof insertVirtualTaxiSchema>;
export type VirtualTaxi = typeof virtualTaxisTable.$inferSelect;
