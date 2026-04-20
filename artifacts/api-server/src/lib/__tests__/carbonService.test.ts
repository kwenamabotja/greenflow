import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateCarbonSavings,
  calculateMultimodalCarbon,
  getModeEmissionFactor,
} from "../carbonService";

describe("Carbon Service - Critical Path", () => {
  describe("calculateCarbonSavings", () => {
    it("should calculate correct CO2 savings for a trip", () => {
      const distance = 15; // km
      const mode = "metrobus";
      
      const result = calculateCarbonSavings(distance, mode);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(distance * 0.5); // Max emission factor
    });

    it("should return zero savings for zero distance", () => {
      const result = calculateCarbonSavings(0, "metrobus");
      expect(result).toBe(0);
    });

    it("should handle negative distance gracefully", () => {
      const result = calculateCarbonSavings(-5, "metrobus");
      expect(result).toBe(0);
    });

    it("should give highest savings for gautrain", () => {
      const distance = 20;
      
      const gautrain = calculateCarbonSavings(distance, "gautrain");
      const metrobus = calculateCarbonSavings(distance, "metrobus");
      const taxi = calculateCarbonSavings(distance, "virtual_taxi");
      
      expect(gautrain.savedCo2Kg).toBeGreaterThan(metrobus.savedCo2Kg);
      expect(metrobus.savedCo2Kg).toBeGreaterThan(taxi.savedCo2Kg);
    });

    it("should give savings for walking (zero emissions)", () => {
      const distance = 2;
      const result = calculateCarbonSavings(distance, "walk");
      
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("getModeEmissionFactor", () => {
    it("should return correct emission factors", () => {
      expect(getModeEmissionFactor("gautrain")).toBe(0.05);
      expect(getModeEmissionFactor("metrobus")).toBe(0.15);
      expect(getModeEmissionFactor("virtual_taxi")).toBe(0.20);
      expect(getModeEmissionFactor("car")).toBe(0.35);
    });

    it("should default to car for unknown mode", () => {
      const factor = getModeEmissionFactor("unknown_mode" as any);
      expect(factor).toBe(0.35); // Car default
    });
  });

  describe("calculateMultimodalCarbon", () => {
    it("should calculate combined carbon for multimodal trips", () => {
      const legs = [
        { distance: 5, mode: "walk" },
        { distance: 10, mode: "metrobus" },
        { distance: 15, mode: "gautrain" },
      ];
      
      const result = calculateMultimodalCarbon(legs);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(legs.reduce((sum, leg) => sum + leg.distance, 0) * 0.35);
    });

    it("should handle empty trip", () => {
      const result = calculateMultimodalCarbon([]);
      expect(result).toBe(0);
    });

    it("should sum legs correctly", () => {
      const legs = [
        { distance: 10, mode: "gautrain" },
        { distance: 10, mode: "gautrain" },
      ];
      
      const combined = calculateMultimodalCarbon(legs);
      const single = calculateCarbonSavings(20, "gautrain");
      
      expect(combined).toBe(single);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large distances", () => {
      const result = calculateCarbonSavings(1000, "metrobus");
      expect(result.savedCo2Kg).toBeGreaterThan(0);
      expect(Number.isFinite(result.savedCo2Kg)).toBe(true);
    });

    it("should handle very small distances", () => {
      const result = calculateCarbonSavings(0.1, "gautrain");
      expect(result).toBeGreaterThanOrEqual(0);
    });

    it("should be consistent across multiple calls", () => {
      const result1 = calculateCarbonSavings(15, "metrobus");
      const result2 = calculateCarbonSavings(15, "metrobus");
      
      expect(result1).toBe(result2);
    });
  });
});
