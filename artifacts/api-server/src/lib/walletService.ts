/**
 * Wallet Service - Green Credits wallet and transaction management
 */
import { db, walletUsersTable, creditTransactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger.js";

export interface CreateWalletUserInput {
  displayName: string;
  maskedId: string;
  preferredMode: string;
  consentGiven: string;
}

export interface WalletUser {
  id: number;
  displayName: string;
  maskedId: string;
  greenCredits: number;
  totalCo2SavedKg: number;
  totalTrips: number;
  preferredMode: string;
  consentGiven: string;
  joinedAt: Date;
  lastTripAt: Date | null;
}

export interface CreditTransaction {
  id: number;
  userId: number;
  credits: number;
  reason: string;
  co2SavedKg: number;
  mode: string;
  modeMultiplier: number;
  baseCredits: number;
  createdAt: Date;
}

/**
 * Create a new wallet user with zero credits
 */
export async function createWalletUser(input: CreateWalletUserInput): Promise<WalletUser> {
  try {
    const result = await db
      .insert(walletUsersTable)
      .values({
        displayName: input.displayName,
        maskedId: input.maskedId,
        greenCredits: 0,
        totalCo2SavedKg: 0,
        totalTrips: 0,
        preferredMode: input.preferredMode,
        consentGiven: input.consentGiven,
      })
      .returning();

    logger.info({ maskedId: input.maskedId }, "Wallet user created");
    return result[0];
  } catch (error) {
    logger.error({ error, input }, "Failed to create wallet user");
    throw error;
  }
}

/**
 * Get current green credits for a user
 */
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const user = await db
      .select()
      .from(walletUsersTable)
      .where(eq(walletUsersTable.maskedId, userId))
      .limit(1);

    return user[0]?.greenCredits ?? 0;
  } catch (error) {
    logger.error({ error, userId }, "Failed to get user credits");
    throw error;
  }
}

/**
 * Add credits to user account
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: string
): Promise<void> {
  try {
    const currentCredits = await getUserCredits(userId);
    const newCredits = currentCredits + amount;

    // Get user ID from masked ID for transaction
    const user = await db
      .select()
      .from(walletUsersTable)
      .where(eq(walletUsersTable.maskedId, userId))
      .limit(1);

    if (!user[0]) {
      throw new Error(`User not found: ${userId}`);
    }

    // Update user credits
    await db
      .update(walletUsersTable)
      .set({ greenCredits: newCredits })
      .where(eq(walletUsersTable.id, user[0].id));

    // Record transaction
    await db.insert(creditTransactionsTable).values({
      userId: user[0].id,
      credits: amount,
      reason: type,
      co2SavedKg: 0,
      mode: "mixed",
      modeMultiplier: 1,
      baseCredits: amount,
    });

    logger.info({ userId, amount, type }, "Credits added");
  } catch (error) {
    logger.error({ error, userId, amount, type }, "Failed to add credits");
    throw error;
  }
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  userId: string,
  amount: number,
  type: string
): Promise<void> {
  try {
    const currentCredits = await getUserCredits(userId);

    if (currentCredits < amount) {
      throw new Error(`Insufficient credits: ${currentCredits} < ${amount}`);
    }

    const newCredits = currentCredits - amount;

    // Get user ID from masked ID for transaction
    const user = await db
      .select()
      .from(walletUsersTable)
      .where(eq(walletUsersTable.maskedId, userId))
      .limit(1);

    if (!user[0]) {
      throw new Error(`User not found: ${userId}`);
    }

    // Update user credits
    await db
      .update(walletUsersTable)
      .set({ greenCredits: newCredits })
      .where(eq(walletUsersTable.id, user[0].id));

    // Record transaction
    await db.insert(creditTransactionsTable).values({
      userId: user[0].id,
      credits: -amount,
      reason: type,
      co2SavedKg: 0,
      mode: "mixed",
      modeMultiplier: 1,
      baseCredits: amount,
    });

    logger.info({ userId, amount, type }, "Credits deducted");
  } catch (error) {
    logger.error({ error, userId, amount, type }, "Failed to deduct credits");
    throw error;
  }
}

/**
 * Get transaction history for user (latest first)
 */
export async function getTransactionHistory(userId: string): Promise<CreditTransaction[]> {
  try {
    // Get user ID from masked ID
    const user = await db
      .select()
      .from(walletUsersTable)
      .where(eq(walletUsersTable.maskedId, userId))
      .limit(1);

    if (!user[0]) {
      return [];
    }

    const transactions = await db
      .select()
      .from(creditTransactionsTable)
      .where(eq(creditTransactionsTable.userId, user[0].id));

    // Return latest first
    return transactions.reverse();
  } catch (error) {
    logger.error({ error, userId }, "Failed to get transaction history");
    throw error;
  }
}
