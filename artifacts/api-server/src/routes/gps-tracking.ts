import { Router, Request, Response } from "express";
import { logger } from "../lib/logger.js";
import { recordGpsPing, getRecentGpsPings, createVirtualTaxi, getActiveTaxis, cleanupExpiredTaxis } from "@workspace/db";

const router = Router();

/**
 * POST /api/gps-tracking/ping
 * Record a GPS ping from a user
 * Body: { userId, latitude, longitude, destination, routeId }
 */
router.post("/ping", async (req: Request, res: Response) => {
  try {
    const { userId, latitude, longitude, destination, routeId } = req.body;

    if (!userId || !latitude || !longitude || !destination) {
      return res.status(400).json({ 
        error: "Missing required fields: userId, latitude, longitude, destination" 
      });
    }

    // Validate coordinates
    if (typeof latitude !== 'number' || typeof longitude !== 'number' ||
        latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        error: "Invalid coordinates" 
      });
    }

    // Record the GPS ping
    await recordGpsPing({
      userId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      destination,
      routeId: routeId || null
    });

    logger.info({ userId, latitude, longitude, destination }, "GPS ping recorded");

    // Check for nearby users and potentially form virtual taxi
    await checkAndFormVirtualTaxi(latitude, longitude, destination, routeId);

    res.json({ 
      success: true, 
      message: "GPS ping recorded",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error({ error }, "Failed to record GPS ping");
    res.status(500).json({ error: "Failed to record GPS ping" });
  }
});

/**
 * GET /api/gps-tracking/nearby/:routeId
 * Get recent GPS pings for clustering
 */
router.get("/nearby/:routeId", async (req: Request, res: Response) => {
  try {
    const { routeId } = req.params;
    const { minutes = 5 } = req.query;

    const recentPings = await getRecentGpsPings(routeId as string, parseInt(minutes as string) || 5);

    res.json({
      routeId,
      timeWindowMinutes: minutes,
      pings: recentPings,
      count: recentPings.length
    });

  } catch (error) {
    logger.error({ error }, "Failed to get nearby GPS pings");
    res.status(500).json({ error: "Failed to get nearby GPS pings" });
  }
});

/**
 * GET /api/gps-tracking/active-taxis
 * Get all currently active virtual taxis
 */
router.get("/active-taxis", async (req: Request, res: Response) => {
  try {
    const activeTaxis = await getActiveTaxis();

    res.json({
      activeTaxis,
      count: activeTaxis.length
    });

  } catch (error) {
    logger.error({ error }, "Failed to get active taxis");
    res.status(500).json({ error: "Failed to get active taxis" });
  }
});

/**
 * POST /api/gps-tracking/cleanup
 * Clean up expired data (admin endpoint)
 */
router.post("/cleanup", async (req: Request, res: Response) => {
  try {
    await cleanupExpiredTaxis();
    
    logger.info("GPS tracking cleanup completed");
    res.json({ 
      success: true, 
      message: "Cleanup completed",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error({ error }, "Failed to cleanup GPS tracking data");
    res.status(500).json({ error: "Failed to cleanup GPS tracking data" });
  }
});

/**
 * Helper function to check for nearby users and form virtual taxis
 */
async function checkAndFormVirtualTaxi(latitude: number, longitude: number, destination: string, routeId?: string) {
  try {
    // Get recent pings in the area (within 500m and last 5 minutes)
    const nearbyPings = await getRecentGpsPings(routeId || "default", 5);
    
    // Filter by distance (within 500 meters)
    const nearbyUsers = nearbyPings.filter(ping => {
      const distance = calculateDistance(latitude, longitude, ping.latitude, ping.longitude);
      return distance <= 0.5; // 500 meters
    });

    // If we have 3+ nearby users with similar destination, form a virtual taxi
    if (nearbyUsers.length >= 3) {
      const uniqueUsers = [...new Set(nearbyUsers.map(p => p.userId))];
      
      if (uniqueUsers.length >= 3) {
        await createVirtualTaxi({
          routeId: routeId || "R001",
          routeName: `Virtual Route ${routeId || "1"}`,
          latitude,
          longitude,
          passengerCount: uniqueUsers.length,
          destination,
          origin: `${latitude},${longitude}`,
          estimatedArrivalMinutes: 15,
          expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
        });

        logger.info({ 
          passengerCount: uniqueUsers.length, 
          destination, 
          latitude, 
          longitude 
        }, "Virtual taxi formed automatically");
      }
    }
  } catch (error) {
    logger.error({ error }, "Failed to check and form virtual taxi");
  }
}

/**
 * Calculate distance between two coordinates in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default router;
