import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateRouteFriction,
  clusterGpsPings,
  findOptimalRoute,
} from "../routePlanningService";

describe("Route Planning Service - Critical Path", () => {
  describe("calculateRouteFriction", () => {
    it("should apply power friction to route cost", () => {
      const powerStage = 4; // Load shedding stage
      const baseCost = 100;
      
      const friction = calculateRouteFriction(baseCost, powerStage);
      
      expect(friction).toBeGreaterThan(baseCost);
      expect(friction).toBeLessThan(baseCost * 1.5);
    });

    it("should increase friction with higher load shedding stages", () => {
      const baseCost = 100;
      
      const stage2 = calculateRouteFriction(baseCost, 2);
      const stage4 = calculateRouteFriction(baseCost, 4);
      const stage6 = calculateRouteFriction(baseCost, 6);
      
      expect(stage2).toBeLessThan(stage4);
      expect(stage4).toBeLessThan(stage6);
    });

    it("should not apply friction when load shedding is 0", () => {
      const baseCost = 100;
      const result = calculateRouteFriction(baseCost, 0);
      
      expect(result).toBe(baseCost);
    });

    it("should handle extreme load shedding stages", () => {
      const baseCost = 100;
      const result = calculateRouteFriction(baseCost, 8);
      
      expect(Number.isFinite(result)).toBe(true);
      expect(result).toBeGreaterThan(baseCost);
    });
  });

  describe("clusterGpsPings", () => {
    it("should cluster nearby GPS pings", () => {
      const pings = [
        { latitude: -26.1076, longitude: 28.0567, userId: "user1" },
        { latitude: -26.1078, longitude: 28.0569, userId: "user2" },
        { latitude: -26.1080, longitude: 28.0571, userId: "user3" },
      ];
      
      const clusters = clusterGpsPings(pings, 1000); // 1km threshold
      
      expect(clusters.length).toBeGreaterThan(0);
      expect(clusters.length).toBeLessThanOrEqual(pings.length);
    });

    it("should create separate clusters for distant pings", () => {
      const pings = [
        { latitude: -26.1076, longitude: 28.0567, userId: "user1" },
        { latitude: -25.0000, longitude: 27.0000, userId: "user2" }, // ~150km away
      ];
      
      const clusters = clusterGpsPings(pings, 1000);
      
      expect(clusters.length).toBe(2);
    });

    it("should handle empty ping list", () => {
      const clusters = clusterGpsPings([], 1000);
      expect(clusters).toEqual([]);
    });

    it("should handle single ping", () => {
      const pings = [{ latitude: -26.1076, longitude: 28.0567, userId: "user1" }];
      
      const clusters = clusterGpsPings(pings, 1000);
      
      expect(clusters.length).toBe(1);
      expect(clusters[0].length).toBe(1);
    });

    it("should compute correct cluster centroid", () => {
      const pings = [
        { latitude: 0, longitude: 0, userId: "user1" },
        { latitude: 2, longitude: 2, userId: "user2" },
      ];
      
      const clusters = clusterGpsPings(pings, 500000);
      const centroid = clusters[0][0];
      
      expect(centroid.latitude).toBeCloseTo(1, 0.1);
      expect(centroid.longitude).toBeCloseTo(1, 0.1);
    });
  });

  describe("findOptimalRoute", () => {
    it("should return a valid route", () => {
      const start = { lat: -26.1076, lng: 28.0567 };
      const end = { lat: -26.2000, lng: 28.0500 };
      
      const route = findOptimalRoute(start, end, { powerStage: 0 });
      
      expect(route).toBeDefined();
      expect(route.distance).toBeGreaterThan(0);
      expect(route.duration).toBeGreaterThan(0);
      expect(route.steps.length).toBeGreaterThan(0);
    });

    it("should apply power friction to route cost", () => {
      const start = { lat: -26.1076, lng: 28.0567 };
      const end = { lat: -26.2000, lng: 28.0500 };
      
      const routeNoPower = findOptimalRoute(start, end, { powerStage: 0 });
      const routeWithPower = findOptimalRoute(start, end, { powerStage: 4 });
      
      expect(routeWithPower.duration).toBeGreaterThan(routeNoPower.duration);
    });

    it("should prefer gautrain when available", () => {
      const start = { lat: -26.1076, lng: 28.0567 };
      const end = { lat: -26.2344, lng: 27.8738 }; // Soweto
      
      const route = findOptimalRoute(start, end, { preferredMode: "gautrain" });
      
      expect(route.modes).toContain("gautrain");
    });

    it("should return shortest distance route", () => {
      const start = { lat: -26.1076, lng: 28.0567 };
      const end = { lat: -26.1100, lng: 28.0600 }; // Nearby
      
      const route = findOptimalRoute(start, end, {});
      
      expect(route.distance).toBeLessThan(5); // < 5km
    });
  });

  describe("Edge Cases", () => {
    it("should handle identical start and end", () => {
      const point = { lat: -26.1076, lng: 28.0567 };
      
      const route = findOptimalRoute(point, point, {});
      
      expect(route.distance).toBe(0);
      expect(route.duration).toBe(0);
    });

    it("should handle extreme coordinates", () => {
      const start = { lat: -90, lng: 0 };
      const end = { lat: 90, lng: 180 };
      
      const route = findOptimalRoute(start, end, {});
      
      expect(route.distance).toBeGreaterThan(0);
      expect(route.distance).toBeLessThan(40000); // Earth circumference
    });

    it("should be consistent across multiple calls", () => {
      const start = { lat: -26.1076, lng: 28.0567 };
      const end = { lat: -26.2000, lng: 28.0500 };
      
      const route1 = findOptimalRoute(start, end, {});
      const route2 = findOptimalRoute(start, end, {});
      
      expect(route1.distance).toBe(route2.distance);
    });
  });
});
