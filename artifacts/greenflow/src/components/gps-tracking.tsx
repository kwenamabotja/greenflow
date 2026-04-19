import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { MapPin, Users, Navigation, Activity, Wifi, WifiOff, Search, Clock, Map } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface GpsPing {
  userId: string;
  latitude: number;
  longitude: number;
  destination: string;
  routeId?: string;
  recordedAt: string;
}

interface VirtualTaxi {
  id: string;
  routeId: string;
  routeName: string;
  latitude: number;
  longitude: number;
  passengerCount: number;
  destination: string;
  origin: string;
  estimatedArrivalMinutes: number;
  formedAt: string;
  expiresAt: string;
}

// Popular Gauteng destinations for autocomplete
const POPULAR_DESTINATIONS = [
  "Sandton City",
  "Rosebank",
  "Melrose Arch",
  "Midrand",
  "Fourways",
  "Randburg",
  "Pretoria CBD",
  "OR Tambo International Airport",
  "Johannesburg CBD",
  "Soweto",
  "Alexandra",
  "Houghton Estate"
];

export function GpsTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState("");
  const [nearbyUsers, setNearbyUsers] = useState<GpsPing[]>([]);
  const [activeTaxis, setActiveTaxis] = useState<VirtualTaxi[]>([]);
  const [lastPing, setLastPing] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wsConnectionRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const newSocket = io("http://localhost:8000", {
          transports: ["websocket", "polling"]
        });

        newSocket.on("connect", () => {
          setIsConnected(true);
          setSocket(newSocket);
          console.log("Connected to GPS tracking WebSocket");
        });

        newSocket.on("disconnect", () => {
          setIsConnected(false);
          setSocket(null);
          console.log("Disconnected from GPS tracking WebSocket");
        });

        newSocket.on("active-taxis", (taxis: VirtualTaxi[]) => {
          setActiveTaxis(taxis);
        });

        newSocket.on("recent-pings", (pings: GpsPing[]) => {
          setNearbyUsers(pings);
        });

        newSocket.on("gps-update-broadcast", (update: GpsPing & { timestamp: string }) => {
          setNearbyUsers(prev => {
            const filtered = prev.filter(p => p.userId !== update.userId);
            return [...filtered, update].sort((a, b) => 
              new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
            ).slice(0, 20);
          });
        });

        newSocket.on("virtual-taxi-formed", (taxi: VirtualTaxi) => {
          setActiveTaxis(prev => [...prev, taxi]);
          console.log("Virtual taxi formed via WebSocket", taxi);
        });

        newSocket.on("virtual-taxi-update", (taxi: VirtualTaxi) => {
          setActiveTaxis(prev => 
            prev.map(t => t.id === taxi.id ? taxi : t)
          );
        });

        newSocket.on("connect_error", (error) => {
          console.error("WebSocket connection error:", error);
          // Retry connection after 5 seconds
          wsConnectionRef.current = setTimeout(connectWebSocket, 5000);
        });

      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        // Retry after 10 seconds
        wsConnectionRef.current = setTimeout(connectWebSocket, 10000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsConnectionRef.current) {
        clearTimeout(wsConnectionRef.current);
      }
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Clean up position watcher on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert("GPS tracking is not supported by your browser");
      return;
    }

    setIsTracking(true);

    // Watch position continuously
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });

        // Send GPS ping to server every 30 seconds
        if (destination) {
          await sendGpsPing(latitude, longitude, destination);
        }
      },
      (error) => {
        console.error("GPS tracking error:", error);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  }, [destination]);

  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  const sendGpsPing = async (latitude: number, longitude: number, destination: string) => {
    try {
      const response = await fetch("/api/gps-tracking/ping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: `user_${Date.now()}`, // In production, use actual user ID
          latitude,
          longitude,
          destination,
          routeId: "R001" // In production, get from route selection
        }),
      });

      const data = await response.json();
      if (data.success) {
        setLastPing(new Date().toLocaleTimeString());
        
        // Fetch nearby users after ping
        await fetchNearbyUsers();
      }
    } catch (error) {
      console.error("Failed to send GPS ping:", error);
    }
  };

  const fetchNearbyUsers = async () => {
    try {
      const response = await fetch("/api/gps-tracking/nearby/R001");
      const data = await response.json();
      setNearbyUsers(data.pings || []);
    } catch (error) {
      console.error("Failed to fetch nearby users:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Real-time GPS Tracking</h1>
            <p className="text-muted-foreground mt-1">
              Live location tracking and virtual taxi formation for Gauteng commuters
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-600">
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Disconnected</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            GPS Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Destination</label>
              <div className="relative">
                <Input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="🔍 Search destination or select popular places..."
                  className="w-full pr-10"
                  disabled={isTracking}
                  onFocus={() => setShowSuggestions(true)}
                />
                {destination && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-6 w-6 p-0"
                    onClick={() => setDestination("")}
                  >
                    ×
                  </Button>
                )}
              </div>
              
              {/* Popular Destinations */}
              {showSuggestions && !destination && (
                <div className="mt-2 p-2 border rounded-lg bg-popover max-h-40 overflow-y-auto">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    📍 Popular Gauteng Destinations
                  </p>
                  <div className="space-y-1">
                    {POPULAR_DESTINATIONS.slice(0, 6).map((dest) => (
                      <button
                        key={dest}
                        className="w-full text-left p-2 text-sm hover:bg-muted rounded transition-colors flex items-center gap-2"
                        onClick={() => {
                          setDestination(dest);
                          setShowSuggestions(false);
                        }}
                      >
                        <MapPin className="w-3 h-3 text-blue-600" />
                        <span>{dest}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      🚀 Quick Actions
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      <button
                        className="p-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                        onClick={() => {
                          setDestination("Sandton City");
                          setShowSuggestions(false);
                        }}
                      >
                        <Clock className="w-3 h-3 inline mr-1" />
                        Work Commute
                      </button>
                      <button
                        className="p-2 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                        onClick={() => {
                          setDestination("OR Tambo International Airport");
                          setShowSuggestions(false);
                        }}
                      >
                        <Map className="w-3 h-3 inline mr-1" />
                        Airport
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Filtered suggestions when typing */}
              {showSuggestions && destination && (
                <div className="mt-2 p-2 border rounded-lg bg-popover max-h-32 overflow-y-auto">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    🔍 Matching Destinations
                  </p>
                  <div className="space-y-1">
                    {POPULAR_DESTINATIONS
                      .filter(dest => dest.toLowerCase().includes(destination.toLowerCase()))
                      .slice(0, 4)
                      .map((dest) => (
                        <button
                          key={dest}
                          className="w-full text-left p-2 text-sm hover:bg-muted rounded transition-colors"
                          onClick={() => {
                            setDestination(dest);
                            setShowSuggestions(false);
                          }}
                        >
                          {dest}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={isTracking}
                onCheckedChange={(checked) => {
                  if (checked) {
                    startTracking();
                  } else {
                    stopTracking();
                  }
                }}
              />
              <label className="text-sm font-medium">
                {isTracking ? "Tracking Active" : "Tracking Inactive"}
              </label>
            </div>
          </div>

          {currentPosition && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Current Position:</p>
              <p className="text-xs text-muted-foreground">
                {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
              </p>
            </div>
          )}

          {lastPing && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800">
                Last ping sent: {lastPing}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nearby Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Nearby Users ({nearbyUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nearbyUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No nearby users found. Start tracking to see nearby commuters.
            </p>
          ) : (
            <div className="space-y-2">
              {nearbyUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">User {user.userId.slice(-6)}</p>
                      <p className="text-xs text-muted-foreground">
                        Going to: {user.destination}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatTime(user.recordedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Virtual Taxis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Active Virtual Taxis ({activeTaxis.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTaxis.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No virtual taxis active yet. Taxis form automatically when 3+ users are nearby.
            </p>
          ) : (
            <div className="space-y-3">
              {activeTaxis.map((taxi) => (
                <div key={taxi.id} className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-600 text-white">
                          {taxi.routeName}
                        </Badge>
                        <Badge variant="outline">
                          {taxi.passengerCount} passengers
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{taxi.destination}</p>
                      <p className="text-xs text-muted-foreground">
                        Formed: {formatTime(taxi.formedAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ETA: {taxi.estimatedArrivalMinutes} minutes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Expires: {formatTime(taxi.expiresAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
