import { Router, type IRouter } from "express";
import { db, transitHubsTable } from "@workspace/db";
import { GetHubParams, ListHubsQueryParams } from "@workspace/api-zod";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/hubs", async (req, res, next): Promise<void> => {
  try {
    const params = ListHubsQueryParams.safeParse(req.query);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    let hubs = await db.select().from(transitHubsTable);
    if (params.data.type) {
      hubs = hubs.filter((h: typeof hubs[number]) => h.type === params.data.type);
    }
    if (params.data.near_lat && params.data.near_lng) {
      const lat = params.data.near_lat;
      const lng = params.data.near_lng;
      const radiusKm = params.data.radius_km ?? 10;
      hubs = hubs.filter((h: typeof hubs[number]) => {
        const dist = Math.sqrt(
          Math.pow((h.latitude - lat) * 111, 2) + Math.pow((h.longitude - lng) * 85, 2)
        );
        return dist <= radiusKm;
      });
    }
    res.json(
      hubs.map((h: typeof hubs[number]) => ({
        id: String(h.id),
        name: h.name,
        type: h.type,
        latitude: h.latitude,
        longitude: h.longitude,
        address: h.address,
        suburb: h.suburb,
        activeVirtualTaxis: h.activeVirtualTaxis,
        nextGautrainDeparture: h.nextGautrainDeparture,
        currentPowerStatus: h.currentPowerStatus,
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.get("/hubs/:hubId", async (req, res, next): Promise<void> => {
  try {
    const params = GetHubParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const hubId = parseInt(params.data.hubId, 10);
    const [hub] = await db.select().from(transitHubsTable).where(eq(transitHubsTable.id, hubId));
    if (!hub) {
      res.status(404).json({ error: "Hub not found" });
      return;
    }
    res.json({
      id: String(hub.id),
      name: hub.name,
      type: hub.type,
      latitude: hub.latitude,
      longitude: hub.longitude,
      address: hub.address,
      suburb: hub.suburb,
      activeVirtualTaxis: hub.activeVirtualTaxis,
      nextGautrainDeparture: hub.nextGautrainDeparture,
      currentPowerStatus: hub.currentPowerStatus,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
