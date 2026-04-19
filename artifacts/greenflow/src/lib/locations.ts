export interface Location {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  icon?: string;
}

export const GAUTENG_LOCATIONS: Location[] = [
  // Johannesburg - South
  {
    id: "sandton-cbd",
    name: "Sandton CBD",
    area: "Johannesburg (North)",
    latitude: -26.1076,
    longitude: 28.0567,
    icon: "🏢",
  },
  {
    id: "park-station",
    name: "Park Station",
    area: "Johannesburg (Central)",
    latitude: -26.1952,
    longitude: 28.0400,
    icon: "🚉",
  },
  {
    id: "soweto",
    name: "Soweto Zone 4",
    area: "Johannesburg (Southwest)",
    latitude: -26.2344,
    longitude: 27.8738,
    icon: "🏘️",
  },
  {
    id: "randburg",
    name: "Randburg CBD",
    area: "Johannesburg (North)",
    latitude: -26.0942,
    longitude: 27.9987,
    icon: "🏙️",
  },
  {
    id: "midrand",
    name: "Midrand",
    area: "Johannesburg (North)",
    latitude: -25.9962,
    longitude: 28.1275,
    icon: "🛍️",
  },

  // Pretoria / Tshwane
  {
    id: "centurion",
    name: "Centurion",
    area: "Tshwane (Southeast)",
    latitude: -25.8601,
    longitude: 28.1882,
    icon: "🏢",
  },
  {
    id: "pretoria-cbd",
    name: "Pretoria CBD",
    area: "Tshwane (Central)",
    latitude: -25.7461,
    longitude: 28.2313,
    icon: "🏛️",
  },
  {
    id: "menlyn",
    name: "Menlyn Park",
    area: "Tshwane (East)",
    latitude: -25.7656,
    longitude: 28.2867,
    icon: "🛍️",
  },

  // East Rand
  {
    id: "kempton-park",
    name: "Kempton Park",
    area: "East Rand",
    latitude: -26.0211,
    longitude: 28.2456,
    icon: "🏙️",
  },
  {
    id: "benoni",
    name: "Benoni",
    area: "East Rand",
    latitude: -26.1533,
    longitude: 28.3333,
    icon: "🏘️",
  },

  // West Rand
  {
    id: "roodepoort",
    name: "Roodepoort",
    area: "West Rand",
    latitude: -26.1628,
    longitude: 27.8667,
    icon: "🏙️",
  },

  // Popular Transit Hubs
  {
    id: "gautrain-central",
    name: "Gautrain Central Station",
    area: "Johannesburg",
    latitude: -26.1945,
    longitude: 28.0395,
    icon: "🚄",
  },
  {
    id: "gautrain-sandton",
    name: "Gautrain Sandton Station",
    area: "Johannesburg (North)",
    latitude: -26.1062,
    longitude: 28.0590,
    icon: "🚄",
  },
  {
    id: "gautrain-pretoria",
    name: "Gautrain Pretoria Station",
    area: "Tshwane",
    latitude: -25.7421,
    longitude: 28.2330,
    icon: "🚄",
  },

  // Popular Destinations
  {
    id: "ortm",
    name: "OR Tambo Airport",
    area: "Johannesburg",
    latitude: -26.1367,
    longitude: 28.2411,
    icon: "✈️",
  },
  {
    id: "uct",
    name: "University of Pretoria",
    area: "Tshwane",
    latitude: -25.7545,
    longitude: 28.2314,
    icon: "🎓",
  },
  {
    id: "wits",
    name: "Wits University",
    area: "Johannesburg",
    latitude: -26.1910,
    longitude: 28.0294,
    icon: "🎓",
  },
];

export function getLocationById(id: string): Location | undefined {
  return GAUTENG_LOCATIONS.find((loc) => loc.id === id);
}

export function getLocationsByArea(area: string): Location[] {
  return GAUTENG_LOCATIONS.filter((loc) => loc.area === area);
}

export function getAreas(): string[] {
  return Array.from(new Set(GAUTENG_LOCATIONS.map((loc) => loc.area))).sort();
}
