import { InsertGpsPing, InsertVirtualTaxi } from ".";
/**
 * Record a GPS ping for a user on a route
 */
export declare function recordGpsPing(ping: InsertGpsPing): Promise<void>;
/**
 * Get recent GPS pings for a route (for clustering)
 * @param routeId The route ID
 * @param withinSeconds Only include pings from last N seconds
 */
export declare function getRecentGpsPings(routeId: string, withinSeconds?: number): Promise<{
    id: string;
    userId: string;
    routeId: string;
    latitude: number;
    longitude: number;
    destination: string;
    recordedAt: Date;
    createdAt: Date;
}[]>;
/**
 * Create a virtual taxi from cluster
 */
export declare function createVirtualTaxi(taxi: InsertVirtualTaxi): Promise<void>;
/**
 * Get all active virtual taxis
 */
export declare function getActiveTaxis(): Promise<{
    id: string;
    routeId: string;
    routeName: string;
    latitude: number;
    longitude: number;
    passengerCount: number;
    destination: string;
    origin: string;
    estimatedArrivalMinutes: number;
    formedAt: Date;
    lastUpdated: Date;
    expiresAt: Date;
}[]>;
/**
 * Get active taxis for a specific route
 */
export declare function getTaxisForRoute(routeId: string): Promise<{
    id: string;
    routeId: string;
    routeName: string;
    latitude: number;
    longitude: number;
    passengerCount: number;
    destination: string;
    origin: string;
    estimatedArrivalMinutes: number;
    formedAt: Date;
    lastUpdated: Date;
    expiresAt: Date;
}[]>;
/**
 * Clean up expired virtual taxis
 */
export declare function cleanupExpiredTaxis(): Promise<number>;
/**
 * Clean up old GPS pings (TTL enforcement)
 */
export declare function cleanupOldGpsPings(olderThanSeconds?: number): Promise<number>;
/**
 * Get GPS ping analytics for a route
 */
export declare function getRoutePingStats(routeId: string, withinHours?: number): Promise<{
    totalPings: number;
    uniqueUsers: number;
    recentPings: number;
    destinations: string[];
}>;
//# sourceMappingURL=operations.d.ts.map