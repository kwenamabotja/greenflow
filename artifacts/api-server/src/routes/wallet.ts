import { Router, type IRouter } from "express";
import { db, walletUsersTable, creditTransactionsTable } from "@workspace/db";
import {
  CreateWalletUserBody,
  AddGreenCreditsBody,
  GetWalletUserParams,
  AddGreenCreditsParams,
} from "@workspace/api-zod";
import { eq, desc } from "drizzle-orm";
import { calculateCarbonSavings } from "../lib/carbonService";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

function generateMaskedId(name: string): string {
  const prefix = name.substring(0, 2).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomPart}`;
}

router.get("/wallet/users", async (_req, res, next): Promise<void> => {
  try {
    const users = await db.select().from(walletUsersTable).orderBy(desc(walletUsersTable.greenCredits));
    const sanitized = users.map((u: typeof users[number]) => ({
      id: String(u.id),
      displayName: u.displayName,
      maskedId: u.maskedId,
      greenCredits: u.greenCredits,
      totalCo2SavedKg: u.totalCo2SavedKg,
      totalTrips: u.totalTrips,
      preferredMode: u.preferredMode,
      joinedAt: u.joinedAt?.toISOString() ?? new Date().toISOString(),
      lastTripAt: u.lastTripAt?.toISOString(),
    }));
    res.json(sanitized);
  } catch (err) {
    next(err);
  }
});

router.post("/wallet/users", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const parsed = CreateWalletUserBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    if (!parsed.data.consentGiven) {
      res.status(400).json({ error: "POPIA consent is required to create a Green Wallet" });
      return;
    }
    const [user] = await db
      .insert(walletUsersTable)
      .values({
        displayName: parsed.data.displayName,
        maskedId: generateMaskedId(parsed.data.displayName),
        preferredMode: parsed.data.preferredMode,
        consentGiven: "true",
        greenCredits: 10,
      })
      .returning();
    res.status(201).json({
      id: String(user.id),
      displayName: user.displayName,
      maskedId: user.maskedId,
      greenCredits: user.greenCredits,
      totalCo2SavedKg: user.totalCo2SavedKg,
      totalTrips: user.totalTrips,
      preferredMode: user.preferredMode,
      joinedAt: user.joinedAt?.toISOString() ?? new Date().toISOString(),
      lastTripAt: user.lastTripAt?.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/wallet/users/:userId", async (req, res, next): Promise<void> => {
  try {
    const params = GetWalletUserParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const userId = parseInt(params.data.userId, 10);
    const [user] = await db.select().from(walletUsersTable).where(eq(walletUsersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: String(user.id),
      displayName: user.displayName,
      maskedId: user.maskedId,
      greenCredits: user.greenCredits,
      totalCo2SavedKg: user.totalCo2SavedKg,
      totalTrips: user.totalTrips,
      preferredMode: user.preferredMode,
      joinedAt: user.joinedAt?.toISOString() ?? new Date().toISOString(),
      lastTripAt: user.lastTripAt?.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.post("/wallet/users/:userId/credits/add", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const params = AddGreenCreditsParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = AddGreenCreditsBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const userId = parseInt(params.data.userId, 10);
    const [user] = await db.select().from(walletUsersTable).where(eq(walletUsersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const distanceKm = parsed.data.tripDistanceKm ?? 10;
    const mode = parsed.data.mode ?? "virtual_taxi";
    const savings = calculateCarbonSavings(distanceKm, mode);
    const [updated] = await db
      .update(walletUsersTable)
      .set({
        greenCredits: user.greenCredits + parsed.data.credits,
        totalCo2SavedKg: user.totalCo2SavedKg + savings.savedCo2Kg,
        totalTrips: user.totalTrips + 1,
        lastTripAt: new Date(),
      })
      .where(eq(walletUsersTable.id, userId))
      .returning();
    await db.insert(creditTransactionsTable).values({
      userId,
      credits: parsed.data.credits,
      reason: parsed.data.reason,
      co2SavedKg: savings.savedCo2Kg,
      mode,
    });
    res.json({
      id: String(updated.id),
      displayName: updated.displayName,
      maskedId: updated.maskedId,
      greenCredits: updated.greenCredits,
      totalCo2SavedKg: updated.totalCo2SavedKg,
      totalTrips: updated.totalTrips,
      preferredMode: updated.preferredMode,
      joinedAt: updated.joinedAt?.toISOString() ?? new Date().toISOString(),
      lastTripAt: updated.lastTripAt?.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/wallet/transactions", async (_req, res, next): Promise<void> => {
  try {
    const txns = await db
      .select({
        id: creditTransactionsTable.id,
        userId: creditTransactionsTable.userId,
        displayName: walletUsersTable.displayName,
        credits: creditTransactionsTable.credits,
        reason: creditTransactionsTable.reason,
        co2SavedKg: creditTransactionsTable.co2SavedKg,
        mode: creditTransactionsTable.mode,
        createdAt: creditTransactionsTable.createdAt,
      })
      .from(creditTransactionsTable)
      .leftJoin(walletUsersTable, eq(creditTransactionsTable.userId, walletUsersTable.id))
      .orderBy(desc(creditTransactionsTable.createdAt))
      .limit(50);
    res.json(
      txns.map((t: typeof txns[number]) => ({
        id: String(t.id),
        userId: String(t.userId),
        displayName: t.displayName ?? "Unknown",
        credits: t.credits,
        reason: t.reason,
        co2SavedKg: t.co2SavedKg,
        mode: t.mode,
        createdAt: t.createdAt?.toISOString() ?? new Date().toISOString(),
      }))
    );
  } catch (err) {
    next(err);
  }
});

export default router;
