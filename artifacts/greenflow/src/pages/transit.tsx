import { useGetVirtualTaxis, useGetGautrainSchedule, useGetTransitFeed } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Car, Train, AlertTriangle, Clock } from "lucide-react";

export default function TransitFeed() {
  const { data: taxis, isLoading: isLoadingTaxis } = useGetVirtualTaxis();
  const { data: gautrain, isLoading: isLoadingGautrain } = useGetGautrainSchedule();
  const { data: feed } = useGetTransitFeed();

  // --- SAFE ARRAY PATTERN ---
  const taxisList = Array.isArray(taxis) ? taxis : [];
  const gautrainList = Array.isArray(gautrain) ? gautrain : [];
  const powerAlertsList = Array.isArray(feed?.powerAlerts) ? feed.powerAlerts : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Live Transit Feed</h1>
        <p className="text-muted-foreground mt-1 italic">
          NCIC 2026: Real-time integration of formal and informal Gauteng networks.
        </p>
      </div>

      {/* POWER AWARE LOGIC: Grid Status Alerts */}
      {powerAlertsList.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 p-4 rounded-md animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <h3 className="font-semibold text-orange-800 dark:text-orange-300">Active Power Alerts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {powerAlertsList.map(alert => (
              <Badge key={alert.id} variant="outline" className="bg-white dark:bg-black border-orange-200 text-orange-700">
                {alert.name} (Stage {alert.stage})
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* VIRTUAL TAXI CARD */}
        <Card className="flex flex-col h-[700px]">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-primary" />
                  Virtual Taxi Clusters
                </CardTitle>
                <CardDescription>High-occupancy community transit</CardDescription>
              </div>
              <Badge variant="secondary">{taxisList.length} Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {isLoadingTaxis ? (
                <div className="p-4 space-y-4 animate-pulse">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-muted/50 rounded-md" />)}
                </div>
              ) : taxisList.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No active virtual taxis.</div>
              ) : (
                <div className="divide-y">
                  {taxisList.map(taxi => (
                    <div key={taxi.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm">{taxi.routeName}</h4>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {taxi.passengerCount} passengers
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className="truncate">{taxi.origin}</span>
                        <span className="text-muted-foreground/50">→</span>
                        <span className="truncate">{taxi.destination}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                        <Clock className="w-3 h-3" />
                        ETA: {taxi.estimatedArrivalMinutes} mins
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* GAUTRAIN CARD */}
        <Card className="flex flex-col h-[700px]">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Train className="w-5 h-5 text-secondary" />
                  Gautrain Departures
                </CardTitle> {/* FIXED TAG HERE */}
                <CardDescription>Real-time GTFS Schedule Sync</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              {isLoadingGautrain ? (
                <div className="p-4 space-y-4 animate-pulse">
                  {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-muted/50 rounded-md" />)}
                </div>
              ) : gautrainList.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No upcoming departures.</div>
              ) : (
                <div className="divide-y">
                  {gautrainList.map(train => (
                    <div key={train.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{train.trainNumber}</h4>
                          <span className="text-xs text-muted-foreground border px-1.5 py-0.5 rounded-sm">Plat {train.platform}</span>
                        </div>
                        <Badge 
                          variant={train.status === 'on_time' ? 'default' : 'destructive'} 
                          className={train.status === 'on_time' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          {train.status.replace('_', ' ').toUpperCase()}
                          {train.status === 'delayed' && ` (+${train.delayMinutes}m)`}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {new Date(train.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-muted-foreground truncate max-w-[100px]">{train.origin}</span>
                        </div>
                        <span className="text-muted-foreground/50">→</span>
                        <div className="flex items-center gap-2 text-right">
                          <span className="text-muted-foreground truncate max-w-[100px]">{train.destination}</span>
                          <span className="font-medium">
                            {new Date(train.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}