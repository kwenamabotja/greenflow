import { Router, type IRouter } from "express";
import { getActiveTaxis, recordGpsPing } from "../lib/virtualTaxiService";
import { getPowerAreas } from "../lib/powerService";
import { getGautrainDepartures } from "../lib/gtfsParser";
import { getMetrobusRoutes, getTaxiRanks } from "../lib/transitService";
import { SendGpsPingBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/transit/feed", async (_req, res, next): Promise<void> => {
  try {
    const virtualTaxis = getActiveTaxis();
    const powerAlerts = await getPowerAreas();
    const gautrainDepartures = getGautrainDepartures();
    const metrobusRoutes = getMetrobusRoutes();

    res.json({
      virtualTaxis,
      gautrainDepartures,
      metrobusRoutes: metrobusRoutes.map((route) => ({
        id: route.id,
        name: route.name,
        routeNumber: route.routeNumber,
        origin: route.origin,
        destination: route.destination,
        currentVehicles: route.currentVehicles,
        co2SavedPerTrip: route.co2SavedPerTrip,
      })),
      powerAlerts,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/transit/virtual-taxis", async (_req, res, next): Promise<void> => {
  try {
    res.json(getActiveTaxis());
  } catch (err) {
    next(err);
  }
});

router.post("/transit/virtual-taxis/ping", requireAuth, async (req, res, next): Promise<void> => {
  try {
    const parsed = SendGpsPingBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const result = recordGpsPing(parsed.data);
    res.json({
      accepted: true,
      virtualTaxiFormed: result.virtualTaxiFormed,
      virtualTaxi: result.virtualTaxi ?? null,
      message: result.virtualTaxiFormed
        ? "Virtual taxi formed — 3+ commuters detected on this route!"
        : "Ping recorded. Waiting for more commuters to cluster.",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/transit/gautrain", async (_req, res, next): Promise<void> => {
  try {
    const departures = getGautrainDepartures();
    res.json(departures);
  } catch (err) {
    next(err);
  }
});

router.get("/transit/metrobus", async (_req, res, next): Promise<void> => {
  try {
    const routes = getMetrobusRoutes();
    res.json(routes);
  } catch (err) {
    next(err);
  }
});

router.get("/transit/taxi-ranks", async (_req, res, next): Promise<void> => {
  try {
    const ranks = getTaxiRanks();
    res.json(ranks);
  } catch (err) {
    next(err);
  }
});

export default router;
