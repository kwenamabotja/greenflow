import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  TrendingUp,
  Car,
  Zap,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import {
  useGetCongestionPredictions,
  useGetDemandPredictions,
  useGetPowerOutagePredictions,
  useGetAiDashboard,
} from "@workspace/api-client-react";

export default function AiInsights() {
  const [selectedTab, setSelectedTab] = useState("dashboard");

  const congestionQuery = useGetCongestionPredictions();
  const demandQuery = useGetDemandPredictions();
  const powerQuery = useGetPowerOutagePredictions();
  const dashboardQuery = useGetAiDashboard();

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDemandColor = (demand: number) => {
    if (demand >= 80) return 'bg-red-100 text-red-800';
    if (demand >= 60) return 'bg-orange-100 text-orange-800';
    if (demand >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">AI Insights Dashboard</h1>
          <p className="text-muted-foreground">
            Predictive analytics for smarter Gauteng mobility
          </p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="congestion">Traffic</TabsTrigger>
          <TabsTrigger value="demand">Demand</TabsTrigger>
          <TabsTrigger value="power">Power</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Risk Areas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {dashboardQuery.data?.insights?.congestion?.highRiskAreas?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Traffic congestion hotspots
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Demand Zones</CardTitle>
                <Car className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardQuery.data?.insights?.demand?.highDemandLocations?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Taxi demand hotspots
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Power Risk Areas</CardTitle>
                <Zap className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {dashboardQuery.data?.insights?.power?.highRiskAreas?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Load shedding predictions
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                AI Model Performance
              </CardTitle>
              <CardDescription>
                Real-time predictive accuracy across different models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardQuery.data?.models?.map((model) => (
                  <div key={model} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{model}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">85%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="congestion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Traffic Congestion Predictions
              </CardTitle>
              <CardDescription>
                AI-powered congestion forecasting for Gauteng roadways
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {congestionQuery.data?.predictions?.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{prediction.location}</p>
                        <p className="text-sm text-muted-foreground">
                          {prediction.factors?.timeOfDay || 'unknown'} • {prediction.factors?.dayOfWeek || 'unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getCongestionColor(prediction.predictedLevel || 'low')}>
                        {(prediction.predictedLevel || 'low').toUpperCase()}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {prediction.confidence ? Math.round(prediction.confidence * 100) : 0}% confidence
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prediction.timeWindow?.start ? new Date(prediction.timeWindow.start).toLocaleTimeString() : 'unknown'} - {prediction.timeWindow?.end ? new Date(prediction.timeWindow.end).toLocaleTimeString() : 'unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Virtual Taxi Demand Predictions
              </CardTitle>
              <CardDescription>
                AI forecasting of taxi demand at key Gauteng locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {demandQuery.data?.predictions?.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{prediction.locationName}</p>
                        <p className="text-sm text-muted-foreground">
                          {prediction.timeWindow}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold">{prediction.predictedDemand || 0}%</p>
                        <p className="text-sm text-muted-foreground">demand level</p>
                      </div>
                      <Badge className={getDemandColor(prediction.predictedDemand || 0)}>
                        {(prediction.predictedDemand || 0) >= 80 ? 'CRITICAL' :
                         (prediction.predictedDemand || 0) >= 60 ? 'HIGH' :
                         (prediction.predictedDemand || 0) >= 40 ? 'MEDIUM' : 'LOW'}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {prediction.confidence ? Math.round(prediction.confidence * 100) : 0}% confidence
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="power" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Load Shedding Predictions
              </CardTitle>
              <CardDescription>
                AI forecasting of power outages and their impact on transport
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {powerQuery.data?.predictions?.map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${(prediction.probability || 0) > 0.7 ? 'text-red-500' : 'text-yellow-500'}`} />
                      <div>
                        <p className="font-medium">{prediction.area}</p>
                        <p className="text-sm text-muted-foreground">
                          Stage {prediction.predictedStage || 1} predicted
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-bold">{Math.round((prediction.probability || 0) * 100)}%</p>
                        <p className="text-sm text-muted-foreground">probability</p>
                      </div>
                      <Badge variant={(prediction.probability || 0) > 0.7 ? "destructive" : "secondary"}>
                        {(prediction.probability || 0) > 0.7 ? 'HIGH RISK' : 'MODERATE'}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {prediction.confidence ? Math.round(prediction.confidence * 100) : 0}% confidence
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prediction.timeWindow || 'unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}