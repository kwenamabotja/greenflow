import { useState } from "react";
import { useListHubs } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Train, Bus, Car, Zap, ZapOff, Activity } from "lucide-react";

type HubType = "gautrain" | "metrobus" | "taxi_rank";

export default function Hubs() {
  const [filterType, setFilterType] = useState<HubType | "all">("all");
  
  const params = filterType !== "all" ? { type: filterType } : undefined;
  const { data: hubs, isLoading } = useListHubs(params, {
    query: {
      queryKey: ["/api/hubs", filterType],
    }
  });

  // --- SAFE DATA HANDLING ---
  const hubsList = Array.isArray(hubs) ? hubs : [];

  const getHubIcon = (type: string) => {
    if (type === 'gautrain') return <Train className="w-5 h-5" />;
    if (type === 'metrobus') return <Bus className="w-5 h-5" />;
    return <Car className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transit Hubs Map</h1>
          <p className="text-muted-foreground mt-1 italic">
            Monitoring infrastructure resilience and grid status across Gauteng.
          </p>
        </div>
        <div className="w-48">
          <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hubs</SelectItem>
              <SelectItem value="gautrain">Gautrain Stations</SelectItem>
              <SelectItem value="metrobus">Metrobus Stops</SelectItem>
              <SelectItem value="taxi_rank">Taxi Ranks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map(i => <Card key={i} className="h-40 bg-muted/50" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubsList.length === 0 ? (
            <div className="col-span-full py-20 text-center text-muted-foreground">
              No hubs found for this category.
            </div>
          ) : (
            hubsList.map((hub) => (
              <Card 
                key={hub.id} 
                className={`transition-all hover:shadow-md ${
                  hub.currentPowerStatus === 'outage' ? "border-destructive/50 bg-destructive/5" : ""
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-md ${
                        hub.type === 'gautrain' ? 'bg-secondary/10 text-secondary' :
                        hub.type === 'metrobus' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {getHubIcon(hub.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">{hub.name}</CardTitle>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{hub.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Badge variant={
                      hub.currentPowerStatus === 'normal' ? 'default' :
                      hub.currentPowerStatus === 'affected' ? 'secondary' : 'destructive'
                    } className="flex items-center gap-1">
                      {hub.currentPowerStatus === 'normal' ? <Activity className="w-3 h-3" /> :
                       hub.currentPowerStatus === 'affected' ? <Zap className="w-3 h-3" /> :
                       <ZapOff className="w-3 h-3" />}
                      {hub.currentPowerStatus}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{hub.address}, {hub.suburb}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm">
                        <span className="font-semibold">{hub.activeVirtualTaxis ?? 0}</span>
                        <span className="text-muted-foreground ml-1">Active Taxis</span>
                      </div>
                      
                      {/* SAFE DATE FORMATTING */}
                      {hub.nextGautrainDeparture && (
                        <div className="text-sm text-right">
                          <span className="text-muted-foreground">Next train: </span>
                          <span className="font-medium">
                            {new Date(hub.nextGautrainDeparture).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}