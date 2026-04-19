import { pgTable, text, real, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gpsPingsTable = pgTable(
  "gps_pings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    routeId: text("route_id").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    destination: text("destination").notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    routeIdIdx: index("idx_gps_pings_route_id").on(table.routeId),
    userIdIdx: index("idx_gps_pings_user_id").on(table.userId),
    createdAtIdx: index("idx_gps_pings_created_at").on(table.createdAt),
    // Composite index for clustering queries
    routeCreatedIdx: index("idx_gps_pings_route_created").on(table.routeId, table.createdAt),
  })
);

export const insertGpsPingSchema = createInsertSchema(gpsPingsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertGpsPing = z.infer<typeof insertGpsPingSchema>;
export type GpsPing = typeof gpsPingsTable.$inferSelect;
