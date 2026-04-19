import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icons
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.setIcon(defaultIcon);

interface LocationMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'gautrain' | 'taxi' | 'power' | 'hub';
  data?: any;
}

const getMarkerColor = (type: string): string => {
  switch (type) {
    case 'gautrain':
      return '#ef4444'; // red
    case 'taxi':
      return '#22c55e'; // green
    case 'power':
      return '#f59e0b'; // amber
    case 'hub':
      return '#3b82f6'; // blue
    default:
      return '#6b7280'; // gray
  }
};

const createCustomIcon = (type: string) => {
  return L.divIcon({
    className: `custom-marker-${type}`,
    html: `
      <div style="
        background-color: ${getMarkerColor(type)};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      ">
        ${type === 'gautrain' ? '🚂' : type === 'taxi' ? '🚕' : type === 'power' ? '⚡' : '📍'}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

export default function GautengeMap() {
  // Center of Gauteng, South Africa
  const gautenCenterLat = -25.75;
  const gautenCenterLng = 28.23;
  const zoomLevel = 10;

  // Sample locations - in production these would come from API data
  const locations: LocationMarker[] = [
    // Gautrain Stations
    {
      id: 'gt-1',
      name: 'Sandton Gautrain Station',
      lat: -26.1076,
      lng: 28.0567,
      type: 'gautrain',
      data: { line: 'Sandton Line', status: 'operational' },
    },
    {
      id: 'gt-2',
      name: 'Park Station',
      lat: -26.1936,
      lng: 28.0425,
      type: 'gautrain',
      data: { line: 'Multi-line Hub', status: 'operational' },
    },
    {
      id: 'gt-3',
      name: 'Pretoria Station',
      lat: -25.7461,
      lng: 28.2203,
      type: 'gautrain',
      data: { line: 'Pretoria Line', status: 'operational' },
    },
    {
      id: 'gt-4',
      name: 'OR Tambo Airport',
      lat: -26.1392,
      lng: 28.2444,
      type: 'gautrain',
      data: { line: 'Airport Line', status: 'operational' },
    },

    // Power Status Areas
    {
      id: 'pw-1',
      name: 'Sandton CBD - Stage 4 Load Shedding',
      lat: -26.11,
      lng: 28.055,
      type: 'power',
      data: { stage: 4, affectedAreas: 34 },
    },
    {
      id: 'pw-2',
      name: 'Soweto Zone 4 - Stage 6 Load Shedding',
      lat: -26.2344,
      lng: 27.8738,
      type: 'power',
      data: { stage: 6, affectedAreas: 52 },
    },
    {
      id: 'pw-3',
      name: 'Centurion - Stage 3 Load Shedding',
      lat: -25.8601,
      lng: 28.1882,
      type: 'power',
      data: { stage: 3, affectedAreas: 27 },
    },

    // Transit Hubs
    {
      id: 'hub-1',
      name: 'Johannesburg CBD Hub',
      lat: -26.1945,
      lng: 28.0397,
      type: 'hub',
      data: { taxis: 12, buses: 8 },
    },
    {
      id: 'hub-2',
      name: 'Midrand Interchange',
      lat: -25.9962,
      lng: 28.1275,
      type: 'hub',
      data: { taxis: 15, buses: 6 },
    },
  ];

  return (
    <div className="w-full h-[400px] rounded-md overflow-hidden border border-border">
      <MapContainer
        center={[gautenCenterLat, gautenCenterLng]}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render all location markers */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={createCustomIcon(location.type)}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{location.name}</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  {location.type === 'gautrain' && (
                    <>
                      <p>📍 {location.data.line}</p>
                      <p>Status: {location.data.status}</p>
                    </>
                  )}
                  {location.type === 'power' && (
                    <>
                      <p>⚡ Stage {location.data.stage} Load Shedding</p>
                      <p>Affected traffic lights: {location.data.affectedAreas}</p>
                    </>
                  )}
                  {location.type === 'hub' && (
                    <>
                      <p>🚕 Virtual Taxis: {location.data.taxis}</p>
                      <p>🚌 Buses: {location.data.buses}</p>
                    </>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Highlight power-affected areas with circles */}
        {locations
          .filter((loc) => loc.type === 'power')
          .map((location) => (
            <Circle
              key={`circle-${location.id}`}
              center={[location.lat, location.lng]}
              radius={3000} // 3km radius
              pathOptions={{
                color: getMarkerColor(location.type),
                fill: true,
                fillColor: getMarkerColor(location.type),
                fillOpacity: 0.15,
              }}
            />
          ))}
      </MapContainer>
    </div>
  );
}
