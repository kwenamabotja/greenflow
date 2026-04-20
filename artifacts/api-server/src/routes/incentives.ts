import { Router, Request, Response } from "express";
import { logger } from "../lib/logger.js";
import { calculateCarbonSavings, getModeMultiplier } from "../lib/carbonService.js";

const router = Router();

interface ModeIncentive {
  mode: string;
  multiplier: number;
  creditsPerTrip: number;
  description: string;
  incentiveLevel: "highest" | "high" | "baseline" | "none";
}

interface IncentiveComparison {
  distance: number;
  mode: string;
  baseCredits: number;
  multiplier: number;
  finalCredits: number;
  bonusCredits: number;
}

/**
 * GET /api/incentives/modes
 * Get all mode multipliers and their incentive levels
 */
router.get("/modes", (req: Request, res: Response) => {
  try {
    const modes: ModeIncentive[] = [
      {
        mode: "gautrain",
        multiplier: 1.5,
        creditsPerTrip: 150,
        description: "Rail-based rapid transit (most sustainable, highest capacity)",
        incentiveLevel: "highest",
      },
      {
        mode: "metrobus",
        multiplier: 1.2,
        creditsPerTrip: 120,
        description: "Bus rapid transit (very sustainable, high capacity)",
        incentiveLevel: "high",
      },
      {
        mode: "virtual_taxi",
        multiplier: 1.0,
        creditsPerTrip: 100,
        description: "Shared minibus/taxi (sustainable, shared mobility)",
        incentiveLevel: "baseline",
      },
      {
        mode: "private_car",
        multiplier: 0,
        creditsPerTrip: 0,
        description: "Personal vehicle (not incentivized, highest emissions)",
        incentiveLevel: "none",
      },
    ];

    logger.info("Incentive modes retrieved");
    res.json({
      message: "Transit preference incentives to drive mode shift",
      strategy:
        "Highest credits for most sustainable modes (rail > bus > shared taxi)",
      modes,
    });
  } catch (error) {
    logger.error({ error }, "Failed to get incentive modes");
    res.status(500).json({ error: "Failed to retrieve incentive modes" });
  }
});

/**
 * POST /api/incentives/compare
 * Compare credits earned for same trip on different modes
 * Body: { distanceKm: number, baseMode: string }
 */
router.post("/compare", (req: Request, res: Response): any => {
  try {
    const { distanceKm = 10, baseMode = "virtual_taxi" } = req.body;

    if (!distanceKm || distanceKm <= 0) {
      return res.status(400).json({ error: "Distance must be positive" });
    }

    const modes = ["gautrain", "metrobus", "virtual_taxi", "private_car"];
    const comparisons: IncentiveComparison[] = modes.map((mode) => {
      const result = calculateCarbonSavings(distanceKm, mode);
      return {
        distance: distanceKm,
        mode,
        baseCredits: result.baseCredits,
        multiplier: result.multiplier,
        finalCredits: result.greenCreditsEarned,
        bonusCredits: result.greenCreditsEarned - result.baseCredits,
      };
    });

    // Sort by final credits (highest first)
    comparisons.sort((a, b) => b.finalCredits - a.finalCredits);

    logger.info({
      topMode: comparisons[0].mode,
      topCredits: comparisons[0].finalCredits,
    }, `Incentive comparison for ${distanceKm}km trip`);

    res.json({
      distance: distanceKm,
      message: `Comparing ${distanceKm}km trip across all modes`,
      comparisons,
      winner: {
        mode: comparisons[0].mode,
        credits: comparisons[0].finalCredits,
        advantage: `${comparisons[0].finalCredits - comparisons[comparisons.length - 1].finalCredits}x more than ${comparisons[comparisons.length - 1].mode}`,
      },
      userBenefit:
        "Users choosing sustainable modes earn significantly more credits to unlock achievements and rewards",
    });
  } catch (error) {
    logger.error({ error }, "Failed to compare incentives");
    res.status(500).json({ error: "Failed to compare incentives" });
  }
});

/**
 * GET /api/incentives/strategy
 * Get the incentive strategy and business case
 */
router.get("/strategy", (req: Request, res: Response) => {
  try {
    const strategy = {
      name: "Transit Preference Incentives",
      goal: "Drive mode shift from private cars to public transit",
      timeframe: "Q2 2026 launch",
      mechanism: "Variable credit multipliers by transport mode",
      rationale: [
        "Gautrain carries 80x more passengers than private cars per lane-km",
        "Metrobus carries 50x more passengers than private cars per lane-km",
        "Credits are behavior drivers - users change behavior for rewards",
        "Other apps show routes; GreenFlow shapes behavior toward sustainability",
      ],
      financials: {
        costPerUser: "R0.50-1.00/trip (credit value at redemption)",
        roi: "1 trip shift from car = R150+ value in social benefits (reduced congestion, emissions, cost)",
        scaleModel:
          "At 50,000 active users with 10 trips/month = 250k credit redemptions = ~R250k/month",
      },
      competitions: [
        {
          name: "Gautrain Challenge",
          goal: "5 Gautrain trips in one week",
          reward: 1000,
          targetDemographic: "Business commuters (Sandton, Midrand)",
        },
        {
          name: "Metrobus Month",
          goal: "10 bus trips in one month",
          reward: 800,
          targetDemographic: "Regular commuters (all areas)",
        },
        {
          name: "Shift Champion",
          goal: "Switch from private car to public transit",
          reward: 2000,
          targetDemographic: "Car commuters (Sandton, surrounding areas)",
        },
      ],
      impacts: {
        environmental:
          "Estimated 500kg CO2 reduction per shifted user per month",
        economic: "Users save ~R2,000/month on fuel, parking, maintenance",
        social:
          "Increased adoption of public transit improves viability and frequency",
        equity: "Bus and rail serve underserved areas; car is privileged mode",
      },
      successMetrics: {
        "gautrain_market_share": "Target 35% of trips by Q4 2026 (from 15%)",
        "mode_shift": "1,000 users permanently shift from private car by Q3 2026",
        "engagement": "50% of users complete at least one incentive challenge",
      },
    };

    res.json(strategy);
  } catch (error) {
    logger.error({ error }, "Failed to get incentive strategy");
    res.status(500).json({ error: "Failed to retrieve strategy" });
  }
});

/**
 * POST /api/incentives/simulate
 * Simulate monthly credit earnings for a user based on trip pattern
 * Body: { trips: Array<{mode: string, distance: number}> }
 */
router.post("/simulate", (req: Request, res: Response): any => {
  try {
    const { trips = [] } = req.body;

    if (!Array.isArray(trips) || trips.length === 0) {
      return res.status(400).json({ error: "Must provide trips array" });
    }

    interface TripSimulation {
      mode: string;
      distance: number;
      co2Saved: number;
      baseCredits: number;
      multiplier: number;
      finalCredits: number;
    }

    interface ModeAggregate {
      count: number;
      totalDistance: number;
      totalCredits: number;
    }

    const tripResults: TripSimulation[] = trips.map((trip: any) => {
      const result = calculateCarbonSavings(trip.distance || 10, trip.mode || "virtual_taxi");
      return {
        mode: trip.mode,
        distance: trip.distance,
        co2Saved: result.savedCo2Kg,
        baseCredits: result.baseCredits,
        multiplier: result.multiplier,
        finalCredits: result.greenCreditsEarned,
      };
    });

    // Aggregate by mode
    const modeStats: Record<string, ModeAggregate> = {};
    let totalCredits = 0;
    let totalCo2 = 0;

    tripResults.forEach((trip) => {
      if (!modeStats[trip.mode]) {
        modeStats[trip.mode] = { count: 0, totalDistance: 0, totalCredits: 0 };
      }
      modeStats[trip.mode].count += 1;
      modeStats[trip.mode].totalDistance += trip.distance;
      modeStats[trip.mode].totalCredits += trip.finalCredits;
      totalCredits += trip.finalCredits;
      totalCo2 += trip.co2Saved;
    });

    logger.info({
      totalTrips: trips.length,
      totalCredits,
      topMode: Object.entries(modeStats).sort(
        ([, a], [, b]) => b.totalCredits - a.totalCredits
      )[0]?.[0],
    }, "Incentive simulation completed");

    res.json({
      input: { tripCount: trips.length },
      results: {
        totalCredits,
        totalCo2Saved: Math.round(totalCo2 * 100) / 100,
        averageCreditsPerTrip: Math.round((totalCredits / trips.length) * 100) / 100,
      },
      breakdown: Object.entries(modeStats).map(([mode, stats]) => ({
        mode,
        tripCount: stats.count,
        totalDistance: stats.totalDistance,
        totalCredits: stats.totalCredits,
        averageCreditsPerTrip: Math.round((stats.totalCredits / stats.count) * 100) / 100,
      })),
      recommendations: [
        modeStats.gautrain?.count > 0
          ? `✅ Gautrain usage detected: earning 1.5x credits! Keep it up.`
          : `💡 Try Gautrain for 1.5x credits instead of other modes`,
        modeStats.metrobus?.count > 0
          ? `✅ Bus usage detected: earning 1.2x credits. Upgrade to Gautrain for 1.5x!`
          : `💡 Metrobus offers 1.2x credits and better coverage`,
        modeStats.private_car?.count > 0
          ? `⚠️ Private car detected: 0 credits. Switch to public transit to earn rewards!`
          : `✅ No private car trips detected. Great job!`,
      ],
    });
  } catch (error) {
    logger.error({ error }, "Failed to simulate incentives");
    res.status(500).json({ error: "Failed to simulate incentives" });
  }
});

export default router;
