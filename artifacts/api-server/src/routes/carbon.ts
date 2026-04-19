import { Router, type IRouter } from "express";
import { db, walletUsersTable } from "@workspace/db";
import { CalculateCarbonSavingsBody } from "@workspace/api-zod";
import { calculateCarbonSavings } from "../lib/carbonService";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.post("/carbon/calculate", async (req, res, next): Promise<void> => {
  try {
    const parsed = CalculateCarbonSavingsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const savings = calculateCarbonSavings(parsed.data.distanceKm, parsed.data.mode);
    res.json(savings);
  } catch (err) {
    next(err);
  }
});

router.get("/carbon/leaderboard", async (_req, res, next): Promise<void> => {
  try {
    const users = await db
      .select()
      .from(walletUsersTable)
      .orderBy(desc(walletUsersTable.totalCo2SavedKg))
      .limit(10);
    const leaderboard = users.map((u: typeof users[number], i: number) => ({
      rank: i + 1,
      userId: String(u.id),
      displayName: u.displayName,
      totalCo2SavedKg: u.totalCo2SavedKg,
      greenCredits: u.greenCredits,
      totalTrips: u.totalTrips,
    }));
    res.json(leaderboard);
  } catch (err) {
    next(err);
  }
});

router.get("/carbon/stats", async (_req, res, next): Promise<void> => {
  try {
    const users = await db.select().from(walletUsersTable);
    const totalCo2SavedKg = users.reduce((s: number, u: typeof users[number]) => s + u.totalCo2SavedKg, 0);
    const totalTrips = users.reduce((s: number, u: typeof users[number]) => s + u.totalTrips, 0);
    const equivalentTreesPlanted = totalCo2SavedKg / 21.77;
    const averageSavingPerTripKg = totalTrips > 0 ? totalCo2SavedKg / totalTrips : 0;
    res.json({
      totalCo2SavedKg: Math.round(totalCo2SavedKg * 100) / 100,
      totalTrips,
      totalUsers: users.length,
      equivalentTreesPlanted: Math.round(equivalentTreesPlanted * 10) / 10,
      averageSavingPerTripKg: Math.round(averageSavingPerTripKg * 100) / 100,
      co2SavedThisWeekKg: Math.round(totalCo2SavedKg * 0.18 * 100) / 100,
      tripsThisWeek: Math.round(totalTrips * 0.18),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/dashboard/summary", async (_req, res, next): Promise<void> => {
  try {
    const users = await db.select().from(walletUsersTable);
    const totalCo2SavedKg = users.reduce((s: number, u: typeof users[number]) => s + u.totalCo2SavedKg, 0);
    const totalTrips = users.reduce((s: number, u: typeof users[number]) => s + u.totalTrips, 0);
    const greenCreditsAwarded = users.reduce((s: number, u: typeof users[number]) => s + u.greenCredits, 0);
    res.json({
      activeTaxis: 3,
      totalCo2SavedKg: Math.round(totalCo2SavedKg * 100) / 100,
      activeUsers: users.length,
      loadSheddingStage: 4,
      affectedAreas: 3,
      tripsToday: Math.round(totalTrips * 0.08),
      greenCreditsAwarded,
      gautrainTripsToday: Math.round(totalTrips * 0.03),
      virtualTaxiTripsToday: Math.round(totalTrips * 0.05),
      equivalentTreesPlanted: Math.round((totalCo2SavedKg / 21.77) * 10) / 10,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
