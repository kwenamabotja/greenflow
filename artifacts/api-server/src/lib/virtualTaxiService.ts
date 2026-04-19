import { logger } from "./logger";

interface GpsPingData {
  userId: string;
  latitude: number;
  longitude: number;
  routeId: string;
  destination: string;
  timestamp: number;
}

interface VirtualTaxiData {
  id: string;
  routeId: string;
  routeName: string;
  latitude: number;
  longitude: number;
  passengerCount: number;
  destination: string;
  origin: string;
  estimatedArrivalMinutes: number;
  lastUpdated: string;
}

const CLUSTERING_THRESHOLD = 3;
const PING_EXPIRY_MS = 5 * 60 * 1000;

const routePings = new Map<string, GpsPingData[]>();
const activeTaxis = new Map<string, VirtualTaxiData>();

const ROUTE_NAMES: Record<string, { name: string; origin: string }> = {
  "R001": { name: "Sandton - Park Station", origin: "Sandton" },
  "R002": { name: "Soweto - CBD", origin: "Soweto" },
  "R003": { name: "Pretoria - Midrand", origin: "Pretoria" },
  "R004": { name: "Alexandra - Sandton", origin: "Alexandra" },
  "R005": { name: "Roodepoort - CBD", origin: "Roodepoort" },
  "R006": { name: "Randburg - Rosebank", origin: "Randburg" },
};

export function recordGpsPing(ping: Omit<GpsPingData, "timestamp">): {
  virtualTaxiFormed: boolean;
  virtualTaxi?: VirtualTaxiData;
} {
  const pingWithTime: GpsPingData = { ...ping, timestamp: Date.now() };

  const existing = routePings.get(ping.routeId) ?? [];
  const fresh = existing.filter(
    (p) => Date.now() - p.timestamp < PING_EXPIRY_MS && p.userId !== ping.userId
  );
  fresh.push(pingWithTime);
  routePings.set(ping.routeId, fresh);

  if (fresh.length >= CLUSTERING_THRESHOLD) {
    const avgLat = fresh.reduce((s, p) => s + p.latitude, 0) / fresh.length;
    const avgLng = fresh.reduce((s, p) => s + p.longitude, 0) / fresh.length;
    const routeInfo = ROUTE_NAMES[ping.routeId] ?? { name: `Route ${ping.routeId}`, origin: "Unknown" };

    const taxiId = `vt-${ping.routeId}-${Date.now()}`;
    const taxi: VirtualTaxiData = {
      id: taxiId,
      routeId: ping.routeId,
      routeName: routeInfo.name,
      latitude: avgLat,
      longitude: avgLng,
      passengerCount: fresh.length,
      destination: ping.destination,
      origin: routeInfo.origin,
      estimatedArrivalMinutes: Math.floor(Math.random() * 20) + 5,
      lastUpdated: new Date().toISOString(),
    };

    activeTaxis.set(taxiId, taxi);
    logger.info({ taxiId, routeId: ping.routeId, passengerCount: fresh.length }, "Virtual taxi formed");

    return { virtualTaxiFormed: true, virtualTaxi: taxi };
  }

  return { virtualTaxiFormed: false };
}

export function getActiveTaxis(): VirtualTaxiData[] {
  const now = Date.now();
  for (const [id, taxi] of activeTaxis.entries()) {
    const age = now - new Date(taxi.lastUpdated).getTime();
    if (age > PING_EXPIRY_MS) {
      activeTaxis.delete(id);
    }
  }

  if (activeTaxis.size === 0) {
    seedDemoTaxis();
  }

  return Array.from(activeTaxis.values());
}

function seedDemoTaxis() {
  const demos: VirtualTaxiData[] = [
    {
      id: "vt-demo-001",
      routeId: "R001",
      routeName: "Sandton - Park Station",
      latitude: -26.1076,
      longitude: 28.0567,
      passengerCount: 4,
      destination: "Park Station",
      origin: "Sandton",
      estimatedArrivalMinutes: 12,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "vt-demo-002",
      routeId: "R004",
      routeName: "Alexandra - Sandton",
      latitude: -26.1019,
      longitude: 28.0726,
      passengerCount: 5,
      destination: "Sandton",
      origin: "Alexandra",
      estimatedArrivalMinutes: 8,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "vt-demo-003",
      routeId: "R002",
      routeName: "Soweto - CBD",
      latitude: -26.2344,
      longitude: 27.8738,
      passengerCount: 6,
      destination: "CBD",
      origin: "Soweto",
      estimatedArrivalMinutes: 22,
      lastUpdated: new Date().toISOString(),
    },
  ];
  for (const t of demos) {
    activeTaxis.set(t.id, t);
  }
}
