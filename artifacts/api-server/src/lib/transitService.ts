import { logger } from "./logger";

export interface MetrobusRoute {
  id: string;
  name: string;
  routeNumber: string;
  origin: string;
  destination: string;
  stops: string[];
  operatingHours: {
    startTime: string;
    endTime: string;
  };
  averageDuration: number; // in minutes
  co2SavedPerTrip: number;
  currentVehicles: number;
}

export interface TaxiRank {
  id: string;
  name: string;
  municipality: string;
  latitude: number;
  longitude: number;
  activeTaxis: number;
  lastUpdated: string;
}

// Realistic Metrobus routes in Gauteng (sample)
const METROBUS_ROUTES: MetrobusRoute[] = [
  {
    id: "MB001",
    name: "Sandton to Soweto Express",
    routeNumber: "1A",
    origin: "Sandton Mall",
    destination: "Soweto Central",
    stops: ["Sandton Mall", "Rosebank", "Parktown", "Braamfontein", "Soweto Central"],
    operatingHours: { startTime: "05:00", endTime: "23:00" },
    averageDuration: 45,
    co2SavedPerTrip: 2.3,
    currentVehicles: 8,
  },
  {
    id: "MB002",
    name: "Pretoria to Johannesburg Route",
    routeNumber: "2B",
    origin: "Pretoria Station",
    destination: "Park Station",
    stops: ["Pretoria Station", "Hatfield", "Midrand", "Sandton", "Park Station"],
    operatingHours: { startTime: "04:30", endTime: "22:30" },
    averageDuration: 60,
    co2SavedPerTrip: 3.1,
    currentVehicles: 12,
  },
  {
    id: "MB003",
    name: "Alexandra to CBD",
    routeNumber: "3C",
    origin: "Alexandra Township",
    destination: "Johannesburg CBD",
    stops: ["Alexandra Township", "Wynberg", "Braamfontein", "Johannesburg CBD"],
    operatingHours: { startTime: "05:30", endTime: "22:00" },
    averageDuration: 35,
    co2SavedPerTrip: 1.8,
    currentVehicles: 10,
  },
  {
    id: "MB004",
    name: "Roodepoort to Sandton",
    routeNumber: "4D",
    origin: "Roodepoort Station",
    destination: "Sandton",
    stops: ["Roodepoort Station", "Florida", "Roodepoort", "Randburg", "Sandton"],
    operatingHours: { startTime: "05:00", endTime: "23:00" },
    averageDuration: 50,
    co2SavedPerTrip: 2.5,
    currentVehicles: 9,
  },
  {
    id: "MB005",
    name: "Centurion to Pretoria CBD",
    routeNumber: "5E",
    origin: "Centurion",
    destination: "Pretoria CBD",
    stops: ["Centurion", "Midrand", "Hatfield", "Pretoria CBD"],
    operatingHours: { startTime: "05:15", endTime: "22:45" },
    averageDuration: 40,
    co2SavedPerTrip: 2.0,
    currentVehicles: 7,
  },
];

// Major taxi ranks in Gauteng
const TAXI_RANKS: TaxiRank[] = [
  {
    id: "TR001",
    name: "Park Station Taxi Rank",
    municipality: "City of Johannesburg",
    latitude: -26.1973,
    longitude: 28.0426,
    activeTaxis: 45,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "TR002",
    name: "Soweto Central Rank",
    municipality: "City of Johannesburg",
    latitude: -26.2344,
    longitude: 27.8738,
    activeTaxis: 32,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "TR003",
    name: "Alexandra Rank",
    municipality: "City of Johannesburg",
    latitude: -26.0583,
    longitude: 28.0633,
    activeTaxis: 28,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "TR004",
    name: "Pretoria Station Rank",
    municipality: "City of Tshwane",
    latitude: -25.6445,
    longitude: 28.2289,
    activeTaxis: 38,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "TR005",
    name: "Centurion Central Rank",
    municipality: "City of Tshwane",
    latitude: -25.8601,
    longitude: 28.1882,
    activeTaxis: 22,
    lastUpdated: new Date().toISOString(),
  },
];

export function getMetrobusRoutes(): MetrobusRoute[] {
  try {
    logger.info({ count: METROBUS_ROUTES.length }, "Retrieved Metrobus routes");
    return METROBUS_ROUTES;
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, "Error retrieving Metrobus routes");
    return [];
  }
}

export function getTaxiRanks(): TaxiRank[] {
  try {
    // Update last updated timestamp
    const ranks = TAXI_RANKS.map((rank) => ({
      ...rank,
      lastUpdated: new Date().toISOString(),
      // Simulate varying taxi counts
      activeTaxis: Math.max(5, rank.activeTaxis + Math.floor((Math.random() - 0.5) * 10)),
    }));
    logger.info({ count: ranks.length }, "Retrieved taxi ranks");
    return ranks;
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, "Error retrieving taxi ranks");
    return [];
  }
}

export function getMetrobusRouteById(id: string): MetrobusRoute | undefined {
  return METROBUS_ROUTES.find((route) => route.id === id);
}

export function getTaxiRankById(id: string): TaxiRank | undefined {
  return TAXI_RANKS.find((rank) => rank.id === id);
}

export function getTransitHubDensity(): { routeCount: number; rankCount: number; totalCapacity: number } {
  const totalCapacity = TAXI_RANKS.reduce((sum, rank) => sum + rank.activeTaxis, 0);
  return {
    routeCount: METROBUS_ROUTES.length,
    rankCount: TAXI_RANKS.length,
    totalCapacity,
  };
}
