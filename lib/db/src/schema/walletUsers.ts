import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const walletUsersTable = pgTable("wallet_users", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").notNull(),
  maskedId: text("masked_id").notNull().unique(),
  greenCredits: integer("green_credits").notNull().default(0),
  totalCo2SavedKg: real("total_co2_saved_kg").notNull().default(0),
  totalTrips: integer("total_trips").notNull().default(0),
  preferredMode: text("preferred_mode").notNull().default("mixed"),
  consentGiven: text("consent_given").notNull().default("false"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  lastTripAt: timestamp("last_trip_at", { withTimezone: true }),
});

export const insertWalletUserSchema = createInsertSchema(walletUsersTable).omit({
  id: true,
  joinedAt: true,
});
export type InsertWalletUser = z.infer<typeof insertWalletUserSchema>;
export type WalletUser = typeof walletUsersTable.$inferSelect;
