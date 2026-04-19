import { Router, type IRouter } from "express";
import { PlanRouteBody } from "@workspace/api-zod";
import { getAreaFrictionPenalty } from "../lib/powerService";
import { calculateCarbonSavings } from "../lib/carbonService";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.post("/routes/plan", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const parsed = PlanRouteBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { originLat, originLng, destLat, destLng, preferGreen } = parsed.data;

    const distanceKm = Math.sqrt(
      Math.pow((destLat - originLat) * 111, 2) + Math.pow((destLng - originLng) * 85, 2)
    );
    const roundedDist = Math.round(distanceKm * 10) / 10;

    // Fetch friction penalties (now async)
    const originFriction = await getAreaFrictionPenalty(originLat, originLng);
    const destFriction = await getAreaFrictionPenalty(destLat, destLng);
    const midFriction = await getAreaFrictionPenalty(
      (originLat + destLat) / 2,
      (originLng + destLng) / 2
    );

  const gautrainSavings = calculateCarbonSavings(roundedDist, "gautrain");
  const taxiSavings = calculateCarbonSavings(roundedDist, "virtual_taxi");
  const carSavings = calculateCarbonSavings(roundedDist, "private_car");

  const routes = [
    {
      id: "route-gt",
      name: "Gautrain + Walk",
      modes: ["gautrain", "walk"],
      distanceKm: roundedDist,
      durationMinutes: Math.round(distanceKm * 2.8 + midFriction * 10),
      frictionPenalty: Math.round(midFriction * 0.3 * 100) / 100,
      co2SavedKg: gautrainSavings.savedCo2Kg,
      greenCreditsEarned: gautrainSavings.greenCreditsEarned + (preferGreen ? 5 : 0),
      segments: [
        {
          mode: "walk",
          fromName: "Origin",
          toName: "Nearest Gautrain",
          durationMinutes: 5,
          distanceKm: 0.4,
          frictionPenalty: originFriction,
        },
        {
          mode: "gautrain",
          fromName: "Nearest Station",
          toName: "Destination Station",
          durationMinutes: Math.round(distanceKm * 2.2),
          distanceKm: roundedDist * 0.9,
          frictionPenalty: 0,
        },
        {
          mode: "walk",
          fromName: "Station",
          toName: "Destination",
          durationMinutes: 5,
          distanceKm: 0.4,
          frictionPenalty: destFriction,
        },
      ],
    },
    {
      id: "route-vt",
      name: "Virtual Taxi",
      modes: ["virtual_taxi"],
      distanceKm: roundedDist,
      durationMinutes: Math.round(distanceKm * 3.5 + midFriction * 20),
      frictionPenalty: Math.round(midFriction * 100) / 100,
      co2SavedKg: taxiSavings.savedCo2Kg,
      greenCreditsEarned: taxiSavings.greenCreditsEarned + (preferGreen ? 3 : 0),
      segments: [
        {
          mode: "virtual_taxi",
          fromName: "Origin",
          toName: "Destination",
          durationMinutes: Math.round(distanceKm * 3.5 + midFriction * 20),
          distanceKm: roundedDist,
          frictionPenalty: midFriction,
        },
      ],
    },
    {
      id: "route-mm",
      name: "Multi-Modal (Taxi + Gautrain)",
      modes: ["virtual_taxi", "gautrain"],
      distanceKm: roundedDist,
      durationMinutes: Math.round(distanceKm * 3.1 + midFriction * 12),
      frictionPenalty: Math.round(midFriction * 0.5 * 100) / 100,
      co2SavedKg: (gautrainSavings.savedCo2Kg + taxiSavings.savedCo2Kg) / 2,
      greenCreditsEarned:
        Math.round((gautrainSavings.greenCreditsEarned + taxiSavings.greenCreditsEarned) / 2) +
        (preferGreen ? 8 : 0),
      segments: [
        {
          mode: "virtual_taxi",
          fromName: "Origin",
          toName: "Gautrain Station",
          durationMinutes: Math.round(distanceKm * 1.5 + originFriction * 10),
          distanceKm: roundedDist * 0.4,
          frictionPenalty: originFriction,
        },
        {
          mode: "gautrain",
          fromName: "Station",
          toName: "Destination Station",
          durationMinutes: Math.round(distanceKm * 1.6),
          distanceKm: roundedDist * 0.6,
          frictionPenalty: 0,
        },
      ],
    },
    {
      id: "route-car",
      name: "Private Car",
      modes: ["private_car"],
      distanceKm: roundedDist,
      durationMinutes: Math.round(distanceKm * 4 + midFriction * 35),
      frictionPenalty: Math.round(midFriction * 100) / 100,
      co2SavedKg: carSavings.savedCo2Kg,
      greenCreditsEarned: 0,
      segments: [
        {
          mode: "walk",
          fromName: "Origin",
          toName: "Destination",
          durationMinutes: Math.round(distanceKm * 4 + midFriction * 35),
          distanceKm: roundedDist,
          frictionPenalty: midFriction,
        },
      ],
    },
  ];

  const affectedAreas: string[] = [];
  if (originFriction > 0.3) affectedAreas.push("Origin area affected by load reduction");
  if (destFriction > 0.3) affectedAreas.push("Destination area affected by load reduction");
  if (midFriction > 0.3) affectedAreas.push("Route passes through load-shedding zones");

  const recommended = preferGreen ? "route-mm" : "route-gt";

    res.json({
      routes,
      recommendedRouteId: recommended,
      powerAffectedAreas: affectedAreas,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
