import { useState } from "react";
import { usePlanRoute } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Navigation, Zap, Leaf, Clock, Map as MapIcon, ArrowRight, ArrowLeftRight } from "lucide-react";
import { GAUTENG_LOCATIONS, getLocationById, getAreas } from "@/lib/locations";

export default function RoutePlanner() {
  const [originId, setOriginId] = useState("sandton-cbd"); // Sandton
  const [destId, setDestId] = useState("park-station"); // Park Station
  const [preferGreen, setPreferGreen] = useState(true);

  const planRoute = usePlanRoute();

  const handlePlanRoute = (e: React.FormEvent) => {
    e.preventDefault();
    const origin = getLocationById(originId);
    const destination = getLocationById(destId);

    if (!origin || !destination) {
      alert("Please select both origin and destination");
      return;
    }

    planRoute.mutate({
      data: {
        originLat: origin.latitude,
        originLng: origin.longitude,
        destLat: destination.latitude,
        destLng: destination.longitude,
        preferGreen
      }
    });
  };

  const handleSwapLocations = () => {
    const temp = originId;
    setOriginId(destId);
    setDestId(temp);
  };

  const originLocation = getLocationById(originId);
  const destLocation = getLocationById(destId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Power-Aware Routes</h1>
        <p className="text-muted-foreground mt-1">Find the optimal route considering load shedding friction and carbon impact.</p>
      </div>

      {/* Journey Summary */}
      {originLocation && destLocation && (
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-right flex-1">
              <p className="text-sm text-muted-foreground">From</p>
              <p className="text-lg font-semibold">{originLocation.icon} {originLocation.name}</p>
              <p className="text-xs text-muted-foreground">{originLocation.area}</p>
            </div>
            <ArrowRight className="w-6 h-6 text-primary shrink-0" />
            <div className="text-left flex-1">
              <p className="text-sm text-muted-foreground">To</p>
              <p className="text-lg font-semibold">{destLocation.icon} {destLocation.name}</p>
              <p className="text-xs text-muted-foreground">{destLocation.area}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              Plan Journey
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePlanRoute} className="space-y-4">
              {/* Origin Location */}
              <div className="space-y-2">
                <Label htmlFor="origin-select">From (Origin)</Label>
                <Select value={originId} onValueChange={setOriginId}>
                  <SelectTrigger id="origin-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {GAUTENG_LOCATIONS.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        <span>{loc.icon} {loc.name} · {loc.area}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSwapLocations}
                  className="gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Swap
                </Button>
              </div>

              {/* Destination Location */}
              <div className="space-y-2">
                <Label htmlFor="dest-select">To (Destination)</Label>
                <Select value={destId} onValueChange={setDestId}>
                  <SelectTrigger id="dest-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {GAUTENG_LOCATIONS.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        <span>{loc.icon} {loc.name} · {loc.area}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="prefer-green" className="cursor-pointer">Prefer Green Routes</Label>
                <Switch id="prefer-green" checked={preferGreen} onCheckedChange={setPreferGreen} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-2 rounded">
                <Zap className="w-4 h-4 text-blue-500" />
                <span>Power-aware routing active - considers load shedding and traffic disruptions</span>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={planRoute.isPending}>
                {planRoute.isPending ? "Calculating..." : "Find Route"}
              </Button>
              {planRoute.error && (
                <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                  Error: {planRoute.error.message || "Failed to plan route"}
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="col-span-1 lg:col-span-2 space-y-4">
          {planRoute.data ? (
            <>
              {planRoute.data.powerAffectedAreas.length > 0 && (
                <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-md flex gap-3">
                  <Zap className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-destructive">Load Shedding Detected</h4>
                    <p className="text-sm text-destructive/80 mt-1">
                      Routing around affected areas: {planRoute.data.powerAffectedAreas.join(", ")}
                    </p>
                  </div>
                </div>
              )}
              <h3 className="font-semibold text-lg mt-2">Available Routes</h3>
              <div className="space-y-4">
                {planRoute.data.routes.map((route) => (
                  <Card key={route.id} className={planRoute.data.recommendedRouteId === route.id ? "border-primary shadow-sm" : ""}>
                    {planRoute.data.recommendedRouteId === route.id && (
                      <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-t-sm flex items-center gap-2">
                        <Leaf className="w-3 h-3" />
                        Recommended Eco Route
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{route.name}</CardTitle>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{route.durationMinutes} min</div>
                          <div className="text-sm text-muted-foreground">{route.distanceKm.toFixed(1)} km</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {route.modes.map((mode, i) => (
                          <Badge key={i} variant="secondary" className="capitalize">
                            {mode.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y my-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Leaf className="w-3 h-3"/> CO₂ Saved</p>
                          <p className="font-semibold text-green-600">{route.co2SavedKg} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Zap className="w-3 h-3"/> Friction</p>
                          <p className="font-semibold text-orange-500">{(route.frictionPenalty * 100).toFixed(0)}%</p>
                          {route.frictionPenalty > 0 && (
                            <p className="text-xs text-orange-600">Power-aware</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapIcon className="w-3 h-3"/> Credits</p>
                          <p className="font-semibold text-blue-600">+{route.greenCreditsEarned}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> Duration</p>
                          <p className="font-semibold">{route.durationMinutes}m</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-muted-foreground">Journey Breakdown</h4>
                        {route.segments.map((seg, idx) => (
                          <div key={idx} className="flex gap-4 items-center">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm capitalize">{seg.mode.replace('_', ' ')}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {seg.fromName} <ArrowRight className="w-3 h-3" /> {seg.toName}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-medium">{seg.durationMinutes}m</div>
                              <div className="text-muted-foreground text-xs">{seg.distanceKm.toFixed(1)}km</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/20">
              <MapPin className="w-12 h-12 mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium text-foreground mb-2">Ready to Plan</h3>
              <p>Enter your origin and destination coordinates to find the most efficient route through the GreenFlow network.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}