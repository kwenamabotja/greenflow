/**
 * Route Planning Service - Handles route optimization with power/load-shedding friction
 */

export interface GpsCoordinate {
  latitude: number;
  longitude: number;
  userId: string;
}

export interface GpsCluster {
  latitude: number;
  longitude: number;
  userId: string;
  clusterSize?: number;
}

export interface RouteLocation {
  lat: number;
  lng: number;
}

export interface RouteOptions {
  powerStage?: number;
  preferredMode?: string;
}

export interface OptimalRoute {
  distance: number;
  duration: number;
  modes: string[];
  steps: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
}

/**
 * Calculate route friction based on load shedding stage
 * Higher stage = higher friction/cost
 */
export function calculateRouteFriction(baseCost: number, powerStage: number): number {
  if (powerStage <= 0) return baseCost;
  
  // Each stage adds 5% friction
  const frictionMultiplier = 1 + powerStage * 0.05;
  return baseCost * frictionMultiplier;
}

/**
 * Haversine distance calculation (km)
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Cluster GPS pings by proximity (threshold in meters)
 */
export function clusterGpsPings(
  pings: GpsCoordinate[],
  thresholdMeters: number
): GpsCluster[][] {
  if (!pings || pings.length === 0) return [];
  
  const thresholdKm = thresholdMeters / 1000;
  const clusters: GpsCluster[][] = [];
  const visited = new Set<number>();

  for (let i = 0; i < pings.length; i++) {
    if (visited.has(i)) continue;

    const cluster: GpsCluster[] = [];
    const queue: number[] = [i];
    visited.add(i);

    while (queue.length > 0) {
      const idx = queue.shift()!;
      const ping = pings[idx];

      // Calculate centroid incrementally
      cluster.push({
        latitude: ping.latitude,
        longitude: ping.longitude,
        userId: ping.userId,
      });

      // Find neighbors
      for (let j = i + 1; j < pings.length; j++) {
        if (visited.has(j)) continue;

        const distance = haversineDistance(
          ping.latitude,
          ping.longitude,
          pings[j].latitude,
          pings[j].longitude
        );

        if (distance <= thresholdKm) {
          visited.add(j);
          queue.push(j);
        }
      }
    }

    // Compute cluster centroid
    if (cluster.length > 0) {
      const centroid = {
        latitude:
          cluster.reduce((sum, p) => sum + p.latitude, 0) / cluster.length,
        longitude:
          cluster.reduce((sum, p) => sum + p.longitude, 0) / cluster.length,
        userId: cluster[0].userId,
        clusterSize: cluster.length,
      };
      clusters.push([centroid]);
    }
  }

  return clusters;
}

/**
 * Find optimal route with power friction consideration
 */
export function findOptimalRoute(
  start: RouteLocation,
  end: RouteLocation,
  options: RouteOptions = {}
): OptimalRoute {
  const { powerStage = 0, preferredMode } = options;

  // Calculate straight-line distance
  const distance = haversineDistance(start.lat, start.lng, end.lat, end.lng);

  // Handle same start and end
  if (distance === 0) {
    return {
      distance: 0,
      duration: 0,
      modes: [],
      steps: [],
    };
  }

  // Estimate duration (5 minutes per km average in Johannesburg)
  const baseDuration = distance * 5;
  const frictionDuration = calculateRouteFriction(baseDuration, powerStage);

  // Generate mock route steps
  const steps = [
    {
      instruction: `Head ${distance > 10 ? 'south-east' : 'toward'} destination`,
      distance: distance * 0.3,
      duration: frictionDuration * 0.3,
    },
    {
      instruction: 'Continue on main route',
      distance: distance * 0.4,
      duration: frictionDuration * 0.4,
    },
    {
      instruction: 'Arrive at destination',
      distance: distance * 0.3,
      duration: frictionDuration * 0.3,
    },
  ];

  // Determine transport modes
  const modes: string[] = [];
  if (preferredMode === 'gautrain') {
    modes.push('gautrain', 'walk');
  } else if (distance < 3) {
    modes.push('walk');
  } else {
    modes.push('metrobus', 'walk');
  }

  return {
    distance,
    duration: frictionDuration,
    modes,
    steps,
  };
}
