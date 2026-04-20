import { pgTable, text, serial, integer, real, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const challengesTable = pgTable("challenges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  goal: integer("goal").notNull(), // e.g., 5 trips, 100km
  goalType: text("goal_type").notNull(), // "trips", "distance", "co2", "mode_trips"
  mode: text("mode"), // specific mode if applicable (gautrain, etc.)
  rewardCredits: integer("reward_credits").notNull(),
  difficulty: text("difficulty").notNull().default("medium"), // easy, medium, hard
  targetDemographic: text("target_demographic").notNull(), // "all", "students", "employers", etc.
  icon: text("icon").notNull(), // emoji or icon identifier
  active: boolean("active").notNull().default(true),
  startDate: timestamp("start_date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertChallengeSchema = createInsertSchema(challengesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challengesTable.$inferSelect;

export const badgesTable = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // emoji
  requirement: text("requirement").notNull(), // "100_trips", "5_gautrain_trips", "1000_kg_co2", etc.
  tier: text("tier").notNull().default("bronze"), // bronze, silver, gold, platinum
  rarity: text("rarity").notNull().default("common"), // common, uncommon, rare, legendary
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBadgeSchema = createInsertSchema(badgesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badgesTable.$inferSelect;

export const userBadgesTable = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeId: integer("badge_id").notNull(),
  unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserBadge = typeof userBadgesTable.$inferSelect;

export const leaderboardScoresTable = pgTable("leaderboard_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  displayName: text("display_name").notNull(),
  scope: text("scope").notNull(), // "global", "employer", "school", "neighborhood"
  scopeValue: text("scope_value"), // employer name, school name, neighborhood name
  totalTrips: integer("total_trips").notNull().default(0),
  totalCo2SavedKg: real("total_co2_saved_kg").notNull().default(0),
  gauttrainTrips: integer("gautrain_trips").notNull().default(0),
  metrobusTrips: integer("metrobus_trips").notNull().default(0),
  virtualTaxiTrips: integer("virtual_taxi_trips").notNull().default(0),
  greenCreditsEarned: integer("green_credits_earned").notNull().default(0),
  badgesEarned: integer("badges_earned").notNull().default(0),
  rank: integer("rank").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type LeaderboardScore = typeof leaderboardScoresTable.$inferSelect;

export const userChallengeProgressTable = pgTable("user_challenge_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  challengeId: integer("challenge_id").notNull(),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  rewardsClaimed: boolean("rewards_claimed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UserChallengeProgress = typeof userChallengeProgressTable.$inferSelect;
