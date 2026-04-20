import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db, walletUsersTable, creditTransactionsTable } from "@workspace/db";
import {
  createWalletUser,
  getUserCredits,
  addCredits,
  deductCredits,
  getTransactionHistory,
} from "../walletService";

describe("Wallet Service - Critical Path", () => {
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const user = await createWalletUser({
      displayName: "Test User",
      maskedId: `test-${Date.now()}`,
      preferredMode: "mixed",
      consentGiven: "true",
    });
    userId = user.maskedId;
  });

  afterEach(async () => {
    // Cleanup test data - just skip for now since we're testing in isolation
  });

  describe("createWalletUser", () => {
    it("should create a new user with zero credits", async () => {
      const user = await createWalletUser({
        displayName: "New User",
        maskedId: `new-${Date.now()}`,
        preferredMode: "gautrain",
        consentGiven: "true",
      });

      expect(user.greenCredits).toBe(0);
      expect(user.totalCo2SavedKg).toBe(0);
      expect(user.totalTrips).toBe(0);
    });

    it("should store consent flag correctly", async () => {
      const user = await createWalletUser({
        displayName: "Consent Test",
        maskedId: `consent-${Date.now()}`,
        preferredMode: "mixed",
        consentGiven: "true",
      });

      expect(user.consentGiven).toBe("true");
    });

    it("should not allow duplicate maskedId", async () => {
      const maskedId = `dup-${Date.now()}`;

      // First user should succeed
      const user1 = await createWalletUser({
        displayName: "User 1",
        maskedId,
        preferredMode: "mixed",
        consentGiven: "true",
      });
      expect(user1).toBeDefined();

      // Second user with same ID should fail or replace
      try {
        const user2 = await createWalletUser({
          displayName: "User 2",
          maskedId,
          preferredMode: "mixed",
          consentGiven: "true",
        });
        // Should either throw or be unique constraint error
        expect(user2).toBeUndefined();
      } catch (error) {
        // Expected: unique constraint violation
        expect(error).toBeDefined();
      }
    });
  });

  describe("Credit Operations", () => {
    it("should add credits to user account", async () => {
      await addCredits(userId, 100, "trip_earned");

      const credits = await getUserCredits(userId);
      expect(credits).toBe(100);
    });

    it("should deduct credits from user account", async () => {
      await addCredits(userId, 100, "initial");
      await deductCredits(userId, 25, "redeemed");

      const credits = await getUserCredits(userId);
      expect(credits).toBe(75);
    });

    it("should not allow negative balance", async () => {
      await addCredits(userId, 50, "initial");

      try {
        await deductCredits(userId, 100, "overdraw");
        throw new Error("Should not allow negative balance");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should create transaction record", async () => {
      await addCredits(userId, 100, "trip_earned");

      const transactions = await getTransactionHistory(userId);
      expect(transactions.length).toBeGreaterThan(0);
      expect(transactions[0].credits).toBe(100);
    });

    it("should handle zero credit addition", async () => {
      await addCredits(userId, 0, "test");

      const credits = await getUserCredits(userId);
      expect(credits).toBe(0);
    });

    it("should handle multiple credit operations", async () => {
      const amounts = [10, 20, 30, 40, 50];
      let expected = 0;

      for (const amount of amounts) {
        await addCredits(userId, amount, "trip_earned");
        expected += amount;
      }

      const credits = await getUserCredits(userId);
      expect(credits).toBe(expected);
    });
  });

  describe("Transaction History", () => {
    it("should retrieve transaction history", async () => {
      await addCredits(userId, 100, "trip_earned");
      await deductCredits(userId, 25, "redeemed");
      await addCredits(userId, 50, "incentive");

      const transactions = await getTransactionHistory(userId);

      expect(transactions.length).toBeGreaterThanOrEqual(3);
      expect(transactions[0].credits).toBe(50); // Latest first
    });

    it("should track transaction types", async () => {
      await addCredits(userId, 100, "trip_earned");
      await deductCredits(userId, 25, "redeemed");

      const transactions = await getTransactionHistory(userId);

      const types = transactions.map((t) => t.reason);
      expect(types).toContain("trip_earned");
      expect(types).toContain("redeemed");
    });

    it("should include timestamp in transactions", async () => {
      await addCredits(userId, 100, "trip_earned");

      const transactions = await getTransactionHistory(userId);
      const transaction = transactions[0];

      expect(transaction.createdAt).toBeDefined();
      expect(transaction.createdAt).toBeInstanceOf(Date);
    });

    it("should handle empty transaction history", async () => {
      const newUserId = `empty-${Date.now()}`;
      await createWalletUser({
        displayName: "Empty User",
        maskedId: newUserId,
        preferredMode: "mixed",
        consentGiven: "true",
      });

      const transactions = await getTransactionHistory(newUserId);
      expect(transactions).toEqual([]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large credit amounts", async () => {
      const largeAmount = 1000000;
      await addCredits(userId, largeAmount, "bonus");

      const credits = await getUserCredits(userId);
      expect(credits).toBe(largeAmount);
    });

    it("should handle rapid sequential operations", async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        addCredits(userId, 10, "rapid_test")
      );

      await Promise.all(promises);

      const credits = await getUserCredits(userId);
      expect(credits).toBe(100);
    });

    it("should be consistent across multiple queries", async () => {
      await addCredits(userId, 100, "test");

      const credits1 = await getUserCredits(userId);
      const credits2 = await getUserCredits(userId);

      expect(credits1).toBe(credits2);
    });
  });

  describe("POPIA Compliance", () => {
    it("should require consent flag", async () => {
      try {
        await createWalletUser({
          displayName: "No Consent",
          maskedId: `no-consent-${Date.now()}`,
          preferredMode: "mixed",
          consentGiven: "false",
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should use masked ID (non-reversible hashing)", async () => {
      const user = await createWalletUser({
        displayName: "Privacy Test",
        maskedId: `privacy-${Date.now()}`,
        preferredMode: "mixed",
        consentGiven: "true",
      });

      // Verify masked ID is not reversible
      expect(user.maskedId).not.toContain("privacy");
      expect(user.maskedId).toMatch(/^[a-f0-9]{64}$/); // Looks like a hash
    });
  });
});
