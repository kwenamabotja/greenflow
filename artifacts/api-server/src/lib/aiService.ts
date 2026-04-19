import { logger } from "./logger";

export interface CongestionPrediction {
  location: string;
  latitude: number;
  longitude: number;
  predictedLevel: 'low' | 'medium' | 'high' | 'severe';
  confidence: number;
  timeWindow: {
    start: string;
    end: string;
  };
  factors: {
    timeOfDay: string;
    dayOfWeek: string;
    weather: string;
    events: string[];
    historicalAverage: number;
  };
}

export interface DemandPrediction {
  locationId: string;
  locationName: string;
  latitude: number;
  longitude: number;
  predictedDemand: number; // 0-100 scale
  confidence: number;
  timeWindow: string;
  factors: {
    historicalDemand: number;
    weather: string;
    events: string[];
    nearbyTransit: string[];
  };
}

export interface RoutePrediction {
  routeId: string;
  origin: string;
  destination: string;
  predictedDuration: number; // minutes
  predictedCarbonSavings: number; // kg CO2
  confidence: number;
  alternativeRoutes: Array<{
    mode: string;
    duration: number;
    carbonImpact: number;
    reliability: number;
  }>;
}

// Mock AI predictions - in production, these would use real ML models
export function predictCongestion(): CongestionPrediction[] {
  const predictions: CongestionPrediction[] = [
    {
      location: "Sandton CBD",
      latitude: -26.1076,
      longitude: 28.0567,
      predictedLevel: 'high',
      confidence: 0.85,
      timeWindow: {
        start: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
        end: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      },
      factors: {
        timeOfDay: "peak_hour",
        dayOfWeek: "weekday",
        weather: "clear",
        events: ["business_district", "school_run"],
        historicalAverage: 7.2,
      },
    },
    {
      location: "OR Tambo Airport",
      latitude: -26.1392,
      longitude: 28.2444,
      predictedLevel: 'medium',
      confidence: 0.78,
      timeWindow: {
        start: new Date(Date.now() + 1800000).toISOString(),
        end: new Date(Date.now() + 3600000).toISOString(),
      },
      factors: {
        timeOfDay: "morning",
        dayOfWeek: "weekday",
        weather: "light_rain",
        events: ["flight_arrivals"],
        historicalAverage: 5.1,
      },
    },
    {
      location: "Pretoria CBD",
      latitude: -25.7461,
      longitude: 28.2203,
      predictedLevel: 'low',
      confidence: 0.92,
      timeWindow: {
        start: new Date(Date.now() + 7200000).toISOString(),
        end: new Date(Date.now() + 10800000).toISOString(),
      },
      factors: {
        timeOfDay: "off_peak",
        dayOfWeek: "weekday",
        weather: "clear",
        events: [],
        historicalAverage: 3.2,
      },
    },
  ];

  logger.info(`Generated ${predictions.length} congestion predictions`);
  return predictions;
}

export function predictDemand(): DemandPrediction[] {
  const predictions: DemandPrediction[] = [
    {
      locationId: "taxi-rank-sandton",
      locationName: "Sandton Taxi Rank",
      latitude: -26.1076,
      longitude: 28.0567,
      predictedDemand: 85,
      confidence: 0.88,
      timeWindow: "18:00-19:00",
      factors: {
        historicalDemand: 78,
        weather: "clear",
        events: ["end_of_business_day"],
        nearbyTransit: ["Gautrain", "Metrobus"],
      },
    },
    {
      locationId: "taxi-rank-soweto",
      locationName: "Soweto Taxi Rank",
      latitude: -26.2344,
      longitude: 27.8738,
      predictedDemand: 92,
      confidence: 0.91,
      timeWindow: "17:00-18:00",
      factors: {
        historicalDemand: 89,
        weather: "clear",
        events: ["commuter_rush"],
        nearbyTransit: ["Metrobus"],
      },
    },
    {
      locationId: "taxi-rank-centurion",
      locationName: "Centurion Mall",
      latitude: -25.8601,
      longitude: 28.1882,
      predictedDemand: 45,
      confidence: 0.76,
      timeWindow: "19:00-20:00",
      factors: {
        historicalDemand: 52,
        weather: "light_rain",
        events: ["shopping_district"],
        nearbyTransit: ["Metrobus"],
      },
    },
  ];

  logger.info(`Generated ${predictions.length} demand predictions`);
  return predictions;
}

export function predictRoute(originLat: number, originLng: number, destLat: number, destLng: number): RoutePrediction {
  // Simple distance calculation for demo
  const distance = Math.sqrt(Math.pow(destLat - originLat, 2) + Math.pow(destLng - originLng, 2)) * 111; // Rough km conversion

  const prediction: RoutePrediction = {
    routeId: `route-${Date.now()}`,
    origin: `${originLat.toFixed(4)},${originLng.toFixed(4)}`,
    destination: `${destLat.toFixed(4)},${destLng.toFixed(4)}`,
    predictedDuration: Math.max(15, distance * 3), // 3 min per km average
    predictedCarbonSavings: distance * 0.12, // 120g CO2 per km saved vs private car
    confidence: 0.82,
    alternativeRoutes: [
      {
        mode: "virtual_taxi",
        duration: Math.max(12, distance * 2.5),
        carbonImpact: distance * 0.08,
        reliability: 0.85,
      },
      {
        mode: "gautrain_bus",
        duration: Math.max(25, distance * 4),
        carbonImpact: distance * 0.03,
        reliability: 0.92,
      },
      {
        mode: "cycling",
        duration: Math.max(30, distance * 8),
        carbonImpact: 0,
        reliability: 0.78,
      },
    ],
  };

  logger.info(`Generated route prediction for ${distance.toFixed(1)}km journey`);
  return prediction;
}

export function predictPowerOutages(): Array<{
  area: string;
  probability: number;
  predictedStage: number;
  timeWindow: string;
  confidence: number;
}> {
  const predictions = [
    {
      area: "Sandton CBD",
      probability: 0.65,
      predictedStage: 4,
      timeWindow: "20:00-22:00",
      confidence: 0.78,
    },
    {
      area: "Soweto Zone 4",
      probability: 0.82,
      predictedStage: 6,
      timeWindow: "18:00-21:00",
      confidence: 0.85,
    },
    {
      area: "Centurion",
      probability: 0.45,
      predictedStage: 3,
      timeWindow: "19:00-23:00",
      confidence: 0.71,
    },
  ];

  logger.info(`Generated ${predictions.length} power outage predictions`);
  return predictions;
}