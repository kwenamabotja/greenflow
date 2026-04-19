import { useState } from "react";
import { useCalculateCarbonSavings, useGetCarbonStats, useGetCarbonLeaderboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Leaf, Trophy, Calculator, Trees, Activity, Medal } from "lucide-react";
import { IncentiveShowcase } from "@/components/incentive-showcase";

type TransitMode = "gautrain" | "virtual_taxi" | "metrobus";

export default function CarbonLedger() {
  const { data: stats } = useGetCarbonStats();
  const { data: leaderboard } = useGetCarbonLeaderboard();
  const calculate = useCalculateCarbonSavings();

  const [distance, setDistance] = useState("15");
  const [mode, setMode] = useState<TransitMode>("gautrain");

  // --- SAFE DATA HANDLING ---
  // Ensuring we always have numbers/arrays to work with to prevent crashes
  const totalCo2 = stats?.totalCo2SavedKg ?? 0;
  const treeCount = stats?.equivalentTreesPlanted ?? 0;
  const weeklyTrips = stats?.tripsThisWeek ?? 0;
  const avgSaving = stats?.averageSavingPerTripKg ?? 0;
  
  const leaderboardList = Array.isArray(leaderboard) ? leaderboard : [];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    calculate.mutate({
      data: {
        distanceKm: parseFloat(distance) || 0,
        mode: mode || "gautrain"
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Carbon Ledger</h1>
        <p className="text-muted-foreground mt-1">
          Gauteng Smart Mobility: Quantifying our path to Net Zero.
        </p>
      </div>

      {/* IMPACT SUMMARY TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary text-primary-foreground border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80 flex items-center gap-2">
              <Leaf className="w-4 h-4" /> Total CO₂ Saved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCo2.toLocaleString()} kg</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Trees className="w-4 h-4 text-green-600" /> Equivalent Trees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{treeCount.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" /> Trips This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weeklyTrips.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calculator className="w-4 h-4 text-orange-600" /> Avg Save/Trip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgSaving.toFixed(1)} kg</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEADERBOARD SECTION */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Green Commuter Leaderboard
            </CardTitle>
            <CardDescription>Top contributors to emission reduction in Gauteng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboardList.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">Waiting for commuters...</p>
              ) : (
                leaderboardList.map((user, idx) => (
                  <div key={user.userId} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold
                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          idx === 1 ? 'bg-gray-200 text-gray-700' : 
                          idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'}`}>
                        {idx < 3 ? <Medal className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.totalTrips} trips</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{user.totalCo2SavedKg.toLocaleString()} kg</p>
                      <p className="text-xs text-blue-600 font-medium">{user.greenCredits} credits</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* CALCULATOR SECTION */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Savings Calculator
            </CardTitle>
            <CardDescription>Estimated savings compared to a single-occupancy vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label>Trip Distance (km)</Label>
                <Input 
                  type="number" 
                  value={distance} 
                  onChange={(e) => setDistance(e.target.value)} 
                  min="1" 
                  step="0.1" 
                />
              </div>
              <div className="space-y-2">
                <Label>Transit Mode</Label>
                <Select value={mode} onValueChange={(val: TransitMode) => setMode(val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gautrain">Gautrain</SelectItem>
                    <SelectItem value="virtual_taxi">Virtual Taxi (Minibus)</SelectItem>
                    <SelectItem value="metrobus">Metrobus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={calculate.isPending}>
                {calculate.isPending ? "Calculating..." : "Calculate Impact"}
              </Button>
            </form>

            {calculate.data && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg p-5 animate-in zoom-in-95">
                <h3 className="font-semibold text-green-800 dark:text-green-400 mb-4 text-center">Impact Results</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-green-700/70 dark:text-green-500/70 mb-1">CO₂ Saved</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{calculate.data.savedCo2Kg.toFixed(2)} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700/70 dark:text-green-500/70 mb-1">Credits Earned</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+{calculate.data.greenCreditsEarned}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200/50 dark:border-green-900/50 text-center text-sm text-green-800/80 dark:text-green-300">
                  Equivalent to {calculate.data.equivalentTreeDays} days of a tree's carbon absorption.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* TRANSIT PREFERENCE INCENTIVES SHOWCASE */}
      <Card className="border-2 border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="text-green-900">Transit Preference Incentives</CardTitle>
          <CardDescription>
            We don't just track sustainability—we actively reward it
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IncentiveShowcase />
        </CardContent>
      </Card>
    </div>
  );
}