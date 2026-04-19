import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const creditTransactionsTable = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  credits: integer("credits").notNull(),
  reason: text("reason").notNull(),
  co2SavedKg: real("co2_saved_kg").notNull().default(0),
  mode: text("mode").notNull().default("mixed"),
  modeMultiplier: real("mode_multiplier").notNull().default(1),
  baseCredits: integer("base_credits").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCreditTransactionSchema = createInsertSchema(creditTransactionsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type CreditTransaction = typeof creditTransactionsTable.$inferSelect;
