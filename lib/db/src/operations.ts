import { db, gpsPingsTable, virtualTaxisTable, InsertGpsPing, InsertVirtualTaxi } from ".";
import { eq, gt, lt, and, desc } from "drizzle-orm";

/**
 * Record a GPS ping for a user on a route
 */
export async function recordGpsPing(ping: InsertGpsPing): Promise<void> {
  const id = `ping-${ping.userId}-${Date.now()}`;
  await db.insert(gpsPingsTable).values({
    id,
    ...ping,
  });
}

/**
 * Get recent GPS pings for a route (for clustering)
 * @param routeId The route ID
 * @param withinSeconds Only include pings from last N seconds
 */
export async function getRecentGpsPings(
  routeId: string,
  withinSeconds: number = 300 // 5 minutes default
) {
  const cutoffTime = new Date(Date.now() - withinSeconds * 1000);
  
  return db
    .select()
    .from(gpsPingsTable)
    .where(
      and(
        eq(gpsPingsTable.routeId, routeId),
        lt(gpsPingsTable.createdAt, new Date()) // ensure valid timestamp
      )
    )
    .orderBy(desc(gpsPingsTable.createdAt));
}

/**
 * Create a virtual taxi from cluster
 */
export async function createVirtualTaxi(taxi: InsertVirtualTaxi): Promise<void> {
  const id = `vt-${taxi.routeId}-${Date.now()}`;
  await db.insert(virtualTaxisTable).values({
    id,
    ...taxi,
  });
}

/**
 * Get all active virtual taxis
 */
export async function getActiveTaxis() {
  const now = new Date();
  return db
    .select()
    .from(virtualTaxisTable)
    .where(gt(virtualTaxisTable.expiresAt, now))
    .orderBy(desc(virtualTaxisTable.formedAt));
}

/**
 * Get active taxis for a specific route
 */
export async function getTaxisForRoute(routeId: string) {
  const now = new Date();
  return db
    .select()
    .from(virtualTaxisTable)
    .where(
      and(
        eq(virtualTaxisTable.routeId, routeId),
        gt(virtualTaxisTable.expiresAt, now)
      )
    );
}

/**
 * Clean up expired virtual taxis
 */
export async function cleanupExpiredTaxis(): Promise<number> {
  const result = await db
    .delete(virtualTaxisTable)
    .where(lt(virtualTaxisTable.expiresAt, new Date()));
  
  return result.rowCount ?? 0;
}

/**
 * Clean up old GPS pings (TTL enforcement)
 */
export async function cleanupOldGpsPings(olderThanSeconds: number = 600): Promise<number> {
  const cutoffTime = new Date(Date.now() - olderThanSeconds * 1000);
  
  const result = await db
    .delete(gpsPingsTable)
    .where(lt(gpsPingsTable.createdAt, cutoffTime));
  
  return result.rowCount ?? 0;
}

/**
 * Get GPS ping analytics for a route
 */
export async function getRoutePingStats(routeId: string, withinHours: number = 1) {
  const cutoffTime = new Date(Date.now() - withinHours * 60 * 60 * 1000);
  
  const pings = await db
    .select()
    .from(gpsPingsTable)
    .where(
      and(
        eq(gpsPingsTable.routeId, routeId)
      )
    );
  
  return {
    totalPings: pings.length,
    uniqueUsers: new Set(pings.map(p => p.userId)).size,
    recentPings: pings.filter(p => p.createdAt > cutoffTime).length,
    destinations: [...new Set(pings.map(p => p.destination))],
  };
}
