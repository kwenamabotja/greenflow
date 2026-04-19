import { useGetDashboardSummary, useGetTransitFeed, useGetPowerStatus } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Car, Leaf, Zap, Train, Users } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: powerStatus, isLoading: isLoadingPower } = useGetPowerStatus();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">Real-time overview of Gauteng's green mobility network.</p>
        </div>
        {powerStatus && (
          <Badge variant={powerStatus.loadSheddingStage > 0 ? "destructive" : "default"} className="px-3 py-1 text-sm">
            <Zap className="w-4 h-4 mr-2" />
            Stage {powerStatus.loadSheddingStage} Load Shedding
          </Badge>
        )}
      </div>

      {isLoadingSummary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1,2,3,4].map(i => <Card key={i} className="h-32 bg-muted/50" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Virtual Taxis</CardTitle>
              <Car className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.activeTaxis || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{summary?.virtualTaxiTripsToday || 0} trips today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total CO₂ Saved</CardTitle>
              <Leaf className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.totalCo2SavedKg?.toLocaleString?.() || 0} kg</div>
              <p className="text-xs text-muted-foreground mt-1">~{summary?.equivalentTreesPlanted || 0} trees planted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Green Wallets</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.activeUsers?.toLocaleString?.() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{summary?.greenCreditsAwarded?.toLocaleString?.() || 0} credits awarded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Gautrain Activity</CardTitle>
              <Train className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary?.gautrainTripsToday || 0} trips</div>
              <p className="text-xs text-muted-foreground mt-1">Recorded today</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 border-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Live Network Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full bg-muted/30 rounded-md border flex items-center justify-center text-muted-foreground">
              [Map Integration Placeholder]
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-border">
          <CardHeader>
            <CardTitle className="text-xl">System Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               <p className="text-sm text-muted-foreground">Monitoring active feeds...</p>
               {/* Feed items will go here */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}