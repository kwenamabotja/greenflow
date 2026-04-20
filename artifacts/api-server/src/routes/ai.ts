import { Router, type IRouter } from "express";
import {
  predictCongestion,
  predictDemand,
  predictRoute,
  predictPowerOutages,
} from "../lib/aiService";

const router: IRouter = Router();

// Get congestion predictions for Gauteng
router.get("/ai/congestion", async (_req, res, next): Promise<void> => {
  try {
    const predictions = predictCongestion();
    res.json({
      predictions,
      generatedAt: new Date().toISOString(),
      model: "congestion-v1.0",
    });
  } catch (err) {
    next(err);
  }
});

// Get demand predictions for virtual taxis
router.get("/ai/demand", async (_req, res, next): Promise<void> => {
  try {
    const predictions = predictDemand();
    res.json({
      predictions,
      generatedAt: new Date().toISOString(),
      model: "demand-v1.0",
    });
  } catch (err) {
    next(err);
  }
});

// Get route predictions with alternatives
router.post("/ai/route", async (req, res, next): Promise<void> => {
  try {
    const { originLat, originLng, destLat, destLng } = req.body;

    if (!originLat || !originLng || !destLat || !destLng) {
      res.status(400).json({
        error: "Missing required parameters: originLat, originLng, destLat, destLng",
      });
      return;
    }

    const prediction = predictRoute(originLat, originLng, destLat, destLng);
    res.json({
      prediction,
      generatedAt: new Date().toISOString(),
      model: "route-optimization-v1.0",
    });
  } catch (err) {
    next(err);
  }
});

// Get power outage predictions
router.get("/ai/power-outages", async (_req, res, next): Promise<void> => {
  try {
    const predictions = predictPowerOutages();
    res.json({
      predictions,
      generatedAt: new Date().toISOString(),
      model: "power-prediction-v1.0",
      disclaimer: "Predictions based on historical patterns and current grid conditions",
    });
  } catch (err) {
    next(err);
  }
});

// Get comprehensive AI insights dashboard
router.get("/ai/dashboard", async (_req, res, next): Promise<void> => {
  try {
    const [congestion, demand, powerOutages] = await Promise.all([
      predictCongestion(),
      predictDemand(),
      predictPowerOutages(),
    ]);

    res.json({
      insights: {
        congestion: {
          highRiskAreas: congestion.filter(c => c.predictedLevel === 'high' || c.predictedLevel === 'severe'),
          totalPredictions: congestion.length,
        },
        demand: {
          highDemandLocations: demand.filter(d => d.predictedDemand > 70),
          averageDemand: demand.reduce((sum, d) => sum + d.predictedDemand, 0) / demand.length,
        },
        power: {
          highRiskAreas: powerOutages.filter(p => p.probability > 0.7),
          averageProbability: powerOutages.reduce((sum, p) => sum + p.probability, 0) / powerOutages.length,
        },
      },
      generatedAt: new Date().toISOString(),
      models: ["congestion-v1.0", "demand-v1.0", "power-prediction-v1.0"],
    });
  } catch (err) {
    next(err);
  }
});

export default router;