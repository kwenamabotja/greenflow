import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart3, Zap, TrendingUp, Award, AlertCircle } from "lucide-react";

interface ModeIncentive {
  mode: string;
  multiplier: number;
  creditsPerTrip: number;
  description: string;
  incentiveLevel: "highest" | "high" | "baseline" | "none";
}

interface IncentiveMode {
  mode: string;
  multiplier: number;
  creditsPerTrip: number;
  description: string;
  incentiveLevel: "highest" | "high" | "baseline" | "none";
}

interface IncentiveComparison {
  distance: number;
  mode: string;
  baseCredits: number;
  multiplier: number;
  finalCredits: number;
  bonusCredits: number;
}

interface ComparisonData {
  distance: number;
  message: string;
  comparisons: IncentiveComparison[];
  winner: {
    mode: string;
    credits: number;
    advantage: string;
  };
  userBenefit: string;
}

interface Strategy {
  name: string;
  goal: string;
  timeframe: string;
  mechanism: string;
  rationale: string[];
  financials: {
    costPerUser: string;
    roi: string;
    scaleModel: string;
  };
  competitions: Array<{
    name: string;
    goal: string;
    reward: number;
    targetDemographic: string;
  }>;
  impacts: {
    environmental: string;
    economic: string;
    social: string;
    equity: string;
  };
  successMetrics: Record<string, string>;
}

const getIncentiveColor = (level: "highest" | "high" | "baseline" | "none") => {
  switch (level) {
    case "highest":
      return "bg-green-600";
    case "high":
      return "bg-blue-600";
    case "baseline":
      return "bg-gray-600";
    case "none":
      return "bg-red-600";
  }
};

const getModeIcon = (mode: string) => {
  switch (mode) {
    case "gautrain":
      return "🚂";
    case "metrobus":
      return "🚌";
    case "virtual_taxi":
      return "🚕";
    case "private_car":
      return "🚗";
    default:
      return "🚗";
  }
};

export function IncentiveShowcase() {
  const [comparisonDistance, setComparisonDistance] = useState(10);

  const { data: modes, isLoading: modesLoading } = useQuery({
    queryKey: ["incentive-modes"],
    queryFn: async () => {
      const response = await fetch("/api/incentives/modes");
      const data = await response.json();
      return data.modes as IncentiveMode[];
    },
  });

  const { data: comparison, isLoading: comparisonLoading } = useQuery({
    queryKey: ["incentive-comparison", comparisonDistance],
    queryFn: async () => {
      const response = await fetch("/api/incentives/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ distanceKm: comparisonDistance }),
      });
      return response.json() as Promise<ComparisonData>;
    },
  });

  const { data: strategy, isLoading: strategyLoading } = useQuery({
    queryKey: ["incentive-strategy"],
    queryFn: async () => {
      const response = await fetch("/api/incentives/strategy");
      return response.json() as Promise<Strategy>;
    },
  });

  if (modesLoading || comparisonLoading || strategyLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading incentive data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strategy Overview */}
      {strategy && (
        <Alert className="border-green-200 bg-green-50">
          <Zap className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Transit Preference Incentives Active:</strong> {strategy?.goal || "Loading..."}
          </AlertDescription>
        </Alert>
      )}

      {/* Mode Incentives Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Mode Credit Multipliers
          </CardTitle>
          <CardDescription>
            Earn more credits by choosing more sustainable transport modes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {modes?.map((mode: ModeIncentive, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getModeIcon(mode.mode)}</span>
                  <div>
                    <p className="font-semibold capitalize">{mode.mode.replace("_", " ")}</p>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${getIncentiveColor(mode.incentiveLevel)} text-white`}>
                    {mode.multiplier}x credits
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(mode.multiplier * 100 - 100)}% bonus
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Key Insight */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900">Why Multipliers Matter:</p>
            <ul className="text-xs text-blue-800 mt-2 space-y-1">
              <li>
                ✅ <strong>Gautrain (1.5x):</strong> Rail is the most efficient mode - incentivized
                heavily
              </li>
              <li>
                ✅ <strong>Metrobus (1.2x):</strong> Bus is very efficient - still incentivized
              </li>
              <li>
                ⚠️ <strong>Virtual Taxi (1.0x):</strong> Baseline for comparison
              </li>
              <li>
                ❌ <strong>Private Car (0x):</strong> Not incentivized - highest emissions
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Trip Comparison Tool */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Credits Comparison
          </CardTitle>
          <CardDescription>
            See how your credits change based on transport choice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Trip Distance:</label>
            <input
              type="range"
              min="5"
              max="50"
              value={comparisonDistance}
              onChange={(e) => setComparisonDistance(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="font-semibold w-16">{comparisonDistance} km</span>
          </div>

          {comparison && (
            <div className="space-y-3">
              {/* Winner Highlight */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Best Choice: {comparison.winner?.mode?.replace("_", " ")?.toUpperCase() || "N/A"}
                </p>
                <p className="text-xs text-green-800 mt-2">{comparison.winner?.advantage || ""}</p>
              </div>

              {/* All Modes Comparison */}
              <div className="space-y-2">
                {comparison.comparisons && Array.isArray(comparison.comparisons) && comparison.comparisons.map((comp: IncentiveComparison, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getModeIcon(comp?.mode || "")}</span>
                      <div>
                        <p className="font-medium capitalize text-sm">
                          {comp?.mode?.replace("_", " ") || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Base: {comp?.baseCredits || 0} × {comp?.multiplier || 1}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{comp?.finalCredits || 0}</p>
                      <p className="text-xs text-green-600 font-semibold">
                        {comp?.bonusCredits && comp.bonusCredits > 0 ? `+${comp.bonusCredits} bonus` : "no bonus"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mode Advantage */}
              {comparison.comparisons && Array.isArray(comparison.comparisons) && comparison.comparisons.length >= 2 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    Choosing{" "}
                    <strong>{comparison.comparisons[0]?.mode?.replace("_", " ") || "best option"}</strong> over{" "}
                    <strong>{comparison.comparisons[comparison.comparisons.length - 1]?.mode?.replace("_", " ") || "worst option"}</strong> earns{" "}
                    <strong>
                      {(comparison.comparisons[0]?.finalCredits || 0) -
                        (comparison.comparisons[comparison.comparisons.length - 1]?.finalCredits || 0)}
                      x more credits
                    </strong>{" "}
                    for this trip!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Case */}
      {strategy && (
        <Card>
          <CardHeader>
            <CardTitle>Incentive Strategy & Impact</CardTitle>
            <CardDescription>Why this drives real behavior change</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-sm mb-2">🎯 Goal</p>
                <p className="text-sm text-muted-foreground">{strategy?.goal || "Loading..."}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-sm mb-2">⏱️ Timeline</p>
                <p className="text-sm text-muted-foreground">{strategy?.timeframe || "Loading..."}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-sm mb-2">💰 Cost Model</p>
                <p className="text-sm text-muted-foreground">
                  {strategy?.financials?.costPerUser || "Loading..."} per trip
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-sm mb-2">📈 ROI</p>
                <p className="text-sm text-muted-foreground">{strategy?.financials?.roi || "Loading..."}</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <p className="font-semibold text-sm">Rationale:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {(strategy?.rationale || []).map((reason: string, idx: number) => (
                  <li key={idx}>• {reason}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 mt-4 pt-4 border-t">
              <p className="font-semibold text-sm">Success Metrics (Q2-Q4 2026):</p>
              <div className="text-sm space-y-2 text-muted-foreground">
                {Object.entries(strategy?.successMetrics || {}).map(([metric, target]) => (
                  <div key={metric} className="flex justify-between">
                    <span className="capitalize">{metric.replace(/_/g, " ")}:</span>
                    <span className="font-semibold text-foreground">{target}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured Competitions */}
      {strategy && (
        <Card>
          <CardHeader>
            <CardTitle>Active Challenges</CardTitle>
            <CardDescription>Compete and earn bonus credits</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(strategy?.competitions || []).map((comp, idx) => (
              <div key={idx} className="p-4 border rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{comp.name}</p>
                    <p className="text-sm text-muted-foreground">{comp.goal}</p>
                    <p className="text-xs text-muted-foreground mt-1">Target: {comp.targetDemographic}</p>
                  </div>
                  <Badge className="bg-green-600 text-white ml-2">+{comp.reward}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
