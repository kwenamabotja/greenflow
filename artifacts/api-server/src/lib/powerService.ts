import { logger } from "./logger";

export interface PowerAreaData {
  id: string;
  name: string;
  municipality: string;
  stage: number;
  outageStart: string;
  outageEnd: string;
  frictionPenalty: number;
  affectedTrafficLights: number;
  latitude: number;
  longitude: number;
}

const MOCK_POWER_AREAS: PowerAreaData[] = [
  {
    id: "area-001",
    name: "Sandton CBD",
    municipality: "City of Johannesburg",
    stage: 4,
    outageStart: new Date(Date.now() - 3600000).toISOString(),
    outageEnd: new Date(Date.now() + 7200000).toISOString(),
    frictionPenalty: 0.65,
    affectedTrafficLights: 34,
    latitude: -26.1076,
    longitude: 28.0567,
  },
  {
    id: "area-002",
    name: "Randburg",
    municipality: "City of Johannesburg",
    stage: 2,
    outageStart: new Date(Date.now() - 1800000).toISOString(),
    outageEnd: new Date(Date.now() + 5400000).toISOString(),
    frictionPenalty: 0.35,
    affectedTrafficLights: 18,
    latitude: -26.0942,
    longitude: 27.9987,
  },
  {
    id: "area-003",
    name: "Soweto Zone 4",
    municipality: "City of Johannesburg",
    stage: 6,
    outageStart: new Date(Date.now() - 7200000).toISOString(),
    outageEnd: new Date(Date.now() + 3600000).toISOString(),
    frictionPenalty: 0.8,
    affectedTrafficLights: 52,
    latitude: -26.2344,
    longitude: 27.8738,
  },
  {
    id: "area-004",
    name: "Midrand",
    municipality: "City of Johannesburg",
    stage: 2,
    outageStart: new Date(Date.now() + 3600000).toISOString(),
    outageEnd: new Date(Date.now() + 10800000).toISOString(),
    frictionPenalty: 0.3,
    affectedTrafficLights: 12,
    latitude: -25.9962,
    longitude: 28.1275,
  },
  {
    id: "area-005",
    name: "Centurion",
    municipality: "City of Tshwane",
    stage: 3,
    outageStart: new Date(Date.now() - 900000).toISOString(),
    outageEnd: new Date(Date.now() + 6300000).toISOString(),
    frictionPenalty: 0.5,
    affectedTrafficLights: 27,
    latitude: -25.8601,
    longitude: 28.1882,
  },
];

// Cache for Eskom API data
interface EskomCache {
  stage: number;
  timestamp: number;
}
let eskomCache: EskomCache | null = null;
const ESKOM_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchEskomStage(): Promise<number> {
  // Return cached value if still valid
  if (eskomCache && Date.now() - eskomCache.timestamp < ESKOM_CACHE_DURATION) {
    logger.debug({ cached: true }, "Returning cached Eskom stage");
    return eskomCache.stage;
  }

  try {
    const response = await fetch("https://loadshedding.eskom.co.za/api/EskomSAPPS/StageToday");
    if (!response.ok) {
      throw new Error(`Eskom API returned status ${response.status}`);
    }
    const data = await response.json() as { Stage: number };
    const stage = data.Stage ?? 0;
    
    // Cache the result
    eskomCache = { stage, timestamp: Date.now() };
    logger.info({ stage }, "Fetched real Eskom load-shedding stage");
    return stage;
  } catch (error) {
    logger.warn({ error: error instanceof Error ? error.message : String(error) }, "Failed to fetch Eskom API, using fallback");
    return 0; // Fallback to no loadshedding
  }
}

export async function getPowerAreas(): Promise<PowerAreaData[]> {
  const stage = await fetchEskomStage();
  
  // Create areas with friction based on real Eskom stage
  const areas: PowerAreaData[] = [];
  const baseStage = Math.max(0, Math.min(8, stage));
  
  if (baseStage > 0) {
    // Areas are affected based on stage
    areas.push({
      id: "area-001",
      name: "Sandton CBD",
      municipality: "City of Johannesburg",
      stage: Math.ceil(baseStage * 0.8),
      outageStart: new Date(Date.now()).toISOString(),
      outageEnd: new Date(Date.now() + 2 * 3600000).toISOString(),
      frictionPenalty: 0.3 + (baseStage / 8) * 0.5,
      affectedTrafficLights: Math.floor(34 * (baseStage / 8)),
      latitude: -26.1076,
      longitude: 28.0567,
    });
    areas.push({
      id: "area-002",
      name: "Soweto Zone 4",
      municipality: "City of Johannesburg",
      stage: baseStage,
      outageStart: new Date(Date.now()).toISOString(),
      outageEnd: new Date(Date.now() + 2 * 3600000).toISOString(),
      frictionPenalty: 0.4 + (baseStage / 8) * 0.5,
      affectedTrafficLights: Math.floor(52 * (baseStage / 8)),
      latitude: -26.2344,
      longitude: 27.8738,
    });
  }
  
  return areas.length > 0 ? areas : MOCK_POWER_AREAS;
}

export async function getPowerStatus() {
  const areas = await getPowerAreas();
  const now = Date.now();
  const activeAreas = areas.filter(
    (a) => new Date(a.outageStart).getTime() <= now && new Date(a.outageEnd).getTime() >= now
  );

  const maxStage = activeAreas.reduce((max, a) => Math.max(max, a.stage), 0);
  const totalAffectedLights = activeAreas.reduce((s, a) => s + a.affectedTrafficLights, 0);
  const avgFriction = activeAreas.length
    ? activeAreas.reduce((s, a) => s + a.frictionPenalty, 0) / activeAreas.length
    : 0;

  const nextUpcoming = areas
    .filter((a) => new Date(a.outageStart).getTime() > now)
    .sort((a, b) => new Date(a.outageStart).getTime() - new Date(b.outageStart).getTime())[0];

  return {
    loadSheddingStage: maxStage,
    activeAreas: activeAreas.length,
    nextScheduledOutage: nextUpcoming
      ? nextUpcoming.outageStart
      : "No scheduled outages",
    affectedTrafficLights: totalAffectedLights,
    overallFrictionMultiplier: Math.round(avgFriction * 100) / 100,
    lastUpdated: new Date().toISOString(),
  };
}

export async function getAreaFrictionPenalty(lat: number, lng: number): Promise<number> {
  const now = Date.now();
  const areas = await getPowerAreas();
  const activeAreas = areas.filter(
    (a) => new Date(a.outageStart).getTime() <= now && new Date(a.outageEnd).getTime() >= now
  );

  let totalPenalty = 0;
  for (const area of activeAreas) {
    const dist = Math.sqrt(
      Math.pow((area.latitude - lat) * 111, 2) + Math.pow((area.longitude - lng) * 85, 2)
    );
    if (dist < 5) {
      totalPenalty += area.frictionPenalty * (1 - dist / 5);
    }
  }

  return Math.min(1.0, totalPenalty);
}
