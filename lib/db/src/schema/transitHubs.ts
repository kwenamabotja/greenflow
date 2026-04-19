import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transitHubsTable = pgTable("transit_hubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  address: text("address").notNull(),
  suburb: text("suburb").notNull(),
  activeVirtualTaxis: integer("active_virtual_taxis").notNull().default(0),
  currentPowerStatus: text("current_power_status").notNull().default("normal"),
  nextGautrainDeparture: text("next_gautrain_departure"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTransitHubSchema = createInsertSchema(transitHubsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTransitHub = z.infer<typeof insertTransitHubSchema>;
export type TransitHub = typeof transitHubsTable.$inferSelect;
