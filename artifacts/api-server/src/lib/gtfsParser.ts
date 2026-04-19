import { logger } from "./logger";

export interface GautrainDeparture {
  id: string;
  trainNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  platform: string;
  status: "on_time" | "delayed" | "cancelled";
  delayMinutes: number;
  co2SavedKg: number;
}

// Mock GTFS data for Gautrain - in production, this would be parsed from actual GTFS files
// This simulates realistic Gautrain schedules
const GAUTRAIN_ROUTES = [
  {
    routeId: "R1",
    routeName: "Sandton to Park Station",
    stops: [
      { stopName: "Sandton", stopId: "ST001", sequence: 1 },
      { stopName: "Midrand", stopId: "MR001", sequence: 2 },
      { stopName: "Rosebank", stopId: "RB001", sequence: 3 },
      { stopName: "Park Station", stopId: "PS001", sequence: 4 },
    ],
    co2SavedPerTrip: 1.8,
  },
  {
    routeId: "R2",
    routeName: "Park Station to Pretoria",
    stops: [
      { stopName: "Park Station", stopId: "PS001", sequence: 1 },
      { stopName: "Hatfield", stopId: "HF001", sequence: 2 },
      { stopName: "Pretoria", stopId: "PT001", sequence: 3 },
    ],
    co2SavedPerTrip: 2.1,
  },
  {
    routeId: "R3",
    routeName: "OR Tambo to Sandton",
    stops: [
      { stopName: "OR Tambo Airport", stopId: "ORT001", sequence: 1 },
      { stopName: "Kempton Park", stopId: "KP001", sequence: 2 },
      { stopName: "Midrand", stopId: "MR001", sequence: 3 },
      { stopName: "Sandton", stopId: "ST001", sequence: 4 },
    ],
    co2SavedPerTrip: 3.2,
  },
];

interface ScheduleEntry {
  tripId: string;
  departureTime: string;
  arrivalTime: string;
}

function generateSchedulesForDay(): Map<string, ScheduleEntry[]> {
  const schedules = new Map<string, ScheduleEntry[]>();
  const now = new Date();

  // Generate realistic schedules for each route
  for (const route of GAUTRAIN_ROUTES) {
    const scheduleList: ScheduleEntry[] = [];

    // Generate departures from 05:00 to 23:59 with varying intervals
    const startHour = 5;
    const endHour = 24;

    for (let hour = startHour; hour < endHour; hour++) {
      const intervalMinutes = hour >= 6 && hour <= 9 ? 15 : hour >= 17 && hour <= 19 ? 12 : 20;

      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const departureDate = new Date(now);
        departureDate.setHours(hour === 24 ? 23 : hour, hour === 24 ? 55 : minute, 0, 0);

        // Only include future schedules
        if (departureDate.getTime() > now.getTime()) {
          const durationMinutes = route.routeId === "R1" ? 14 : route.routeId === "R2" ? 45 : 35;
          const arrivalDate = new Date(departureDate.getTime() + durationMinutes * 60 * 1000);

          scheduleList.push({
            tripId: `${route.routeId}-${hour}-${minute}`,
            departureTime: departureDate.toISOString(),
            arrivalTime: arrivalDate.toISOString(),
          });
        }
      }
    }

    schedules.set(route.routeId, scheduleList);
  }

  return schedules;
}

function generateTrainNumber(routeId: string, index: number): string {
  const prefix = routeId === "R1" ? "G2" : routeId === "R2" ? "G4" : "G7";
  return `${prefix}${String(index).padStart(2, "0")}`;
}

export function getGautrainDepartures(): GautrainDeparture[] {
  try {
    const schedules = generateSchedulesForDay();
    const departures: GautrainDeparture[] = [];

    let globalIndex = 0;
    for (const route of GAUTRAIN_ROUTES) {
      const scheduleList = schedules.get(route.routeId) || [];

      // Take the next 5 departures for this route
      for (let i = 0; i < Math.min(5, scheduleList.length); i++) {
        const schedule = scheduleList[i];
        const departureTime = new Date(schedule.departureTime);
        const arrivalTime = new Date(schedule.arrivalTime);
        const now = new Date();

        // Random delay (80% on time, 20% delayed)
        const isDelayed = Math.random() < 0.2;
        const delayMinutes = isDelayed ? Math.floor(Math.random() * 8) + 2 : 0;

        if (isDelayed) {
          departureTime.setMinutes(departureTime.getMinutes() + delayMinutes);
          arrivalTime.setMinutes(arrivalTime.getMinutes() + delayMinutes);
        }

        departures.push({
          id: `gt-${globalIndex}`,
          trainNumber: generateTrainNumber(route.routeId, i),
          origin: route.stops[0].stopName,
          destination: route.stops[route.stops.length - 1].stopName,
          departureTime: departureTime.toISOString(),
          arrivalTime: arrivalTime.toISOString(),
          platform: `${Math.floor(Math.random() * 3) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
          status: isDelayed ? "delayed" : departureTime.getTime() < now.getTime() ? "cancelled" : "on_time",
          delayMinutes,
          co2SavedKg: route.co2SavedPerTrip,
        });

        globalIndex++;
      }
    }

    // Sort by departure time and take next 8
    departures.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    logger.info({ count: departures.length }, "Generated Gautrain GTFS schedule");
    return departures.slice(0, 8);
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Error parsing Gautrain GTFS"
    );
    return [];
  }
}

export function getGautrainRoutes() {
  return GAUTRAIN_ROUTES;
}
