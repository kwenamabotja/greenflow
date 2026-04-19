import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Zap, Globe, Building2, BookOpen, MapPin } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalTrips: number;
  totalCo2SavedKg: number;
  greenCreditsEarned: number;
  badgesEarned: number;
  topMode: string;
}

interface LeaderboardResponse {
  scope: string;
  leaderboard: LeaderboardEntry[];
}

interface UserProgress {
  displayName: string;
  totalTrips: number;
  totalCo2SavedKg: number;
  greenCreditsEarned: number;
  badgesEarned: number;
  globalRank: number;
  employerRank: number;
}

const getMedalIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return "◆";
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
    default:
      return "🚗";
  }
};

export default function Leaderboards() {
  const [selectedScope, setSelectedScope] = useState("global");

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["leaderboard", selectedScope],
    queryFn: async () => {
      const response = await fetch(`/api/gamification/leaderboards?scope=${selectedScope}`);
      return response.json() as Promise<LeaderboardResponse>;
    },
  });

  const { data: userProgress, isLoading: userLoading } = useQuery({
    queryKey: ["user-progress"],
    queryFn: async () => {
      const response = await fetch("/api/gamification/user/progress");
      return response.json() as Promise<UserProgress>;
    },
  });

  const loading = leaderboardLoading || userLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading leaderboards...</p>
      </div>
    );
  }

  const leaderboard = leaderboardData?.leaderboard || [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-600" />
          Leaderboards
        </h1>
        <p className="text-muted-foreground">
          See how you rank against other GreenFlow users in your community
        </p>
      </div>

      {/* YOUR RANK CARD */}
      {userProgress && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Global Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">#{userProgress.globalRank}</div>
              <p className="text-xs text-blue-800 mt-1">
                {userProgress.globalRank <= 100 ? "🌟 Top 100" : "Keep going!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userProgress.totalTrips.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Sustainable journeys</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">CO2 Saved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {userProgress.totalCo2SavedKg.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">kg of CO2</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{userProgress.badgesEarned}</div>
              <p className="text-xs text-muted-foreground">Achievements unlocked</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* LEADERBOARDS BY SCOPE */}
      <Tabs defaultValue="global" onValueChange={setSelectedScope} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Global
          </TabsTrigger>
          <TabsTrigger value="employer" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Employer
          </TabsTrigger>
          <TabsTrigger value="school" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            School
          </TabsTrigger>
          <TabsTrigger value="neighborhood" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Area
          </TabsTrigger>
        </TabsList>

        {["global", "employer", "school", "neighborhood"].map((scope) => (
          <TabsContent key={scope} value={scope} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {scope === "global"
                    ? "🌍 Global Leaderboard"
                    : scope === "employer"
                      ? "🏢 Your Employer"
                      : scope === "school"
                        ? "🎓 Your School"
                        : "🏘️ Your Neighborhood"}
                </CardTitle>
                <CardDescription>
                  {scope === "global"
                    ? "Top performers across all of Gauteng"
                    : scope === "employer"
                      ? "Top performers at your company"
                      : scope === "school"
                        ? "Top performers at your school"
                        : "Top performers in your area"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.map((entry, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        userProgress && entry.displayName === userProgress.displayName
                          ? "bg-blue-50 border-blue-300"
                          : "hover:bg-muted transition-colors"
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg">
                          {getMedalIcon(entry.rank)}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {entry.displayName}
                            {userProgress && entry.displayName === userProgress.displayName && (
                              <Badge variant="secondary" className="ml-2">
                                You
                              </Badge>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {entry.totalTrips} trips
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {entry.totalCo2SavedKg.toLocaleString()} kg CO2
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className="text-xs">{getModeIcon(entry.topMode)}</span>
                          <Badge variant="outline" className="capitalize">
                            {entry.topMode.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="font-bold text-lg text-blue-600">
                          {entry.greenCreditsEarned.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">credits earned</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* STATS INSIGHT */}
            {scope === "global" && (
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="pt-6">
                  <p className="text-sm font-semibold text-gray-900 mb-2">💡 Did you know?</p>
                  <p className="text-sm text-gray-700">
                    The top performers on GreenFlow have saved over 2,000kg of CO2 collectively—that's equivalent to
                    planting over 30 trees! Keep climbing the rankings to join the elite.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* ACHIEVEMENT TIERS */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Tiers</CardTitle>
          <CardDescription>Milestones to unlock special status and rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <div className="flex items-start justify-between p-3 border rounded-lg bg-yellow-50">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🥉</span>
                <div>
                  <p className="font-semibold">Bronze Tier</p>
                  <p className="text-sm text-muted-foreground">50+ trips completed</p>
                </div>
              </div>
              <Badge>Achieved</Badge>
            </div>

            <div className="flex items-start justify-between p-3 border rounded-lg bg-gray-50">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🥈</span>
                <div>
                  <p className="font-semibold">Silver Tier</p>
                  <p className="text-sm text-muted-foreground">200+ trips completed</p>
                </div>
              </div>
              <Badge variant="outline">In Progress: 78%</Badge>
            </div>

            <div className="flex items-start justify-between p-3 border rounded-lg opacity-50">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🥇</span>
                <div>
                  <p className="font-semibold">Gold Tier</p>
                  <p className="text-sm text-muted-foreground">500+ trips completed</p>
                </div>
              </div>
              <Badge variant="outline">Locked</Badge>
            </div>

            <div className="flex items-start justify-between p-3 border rounded-lg opacity-50">
              <div className="flex items-start gap-3">
                <span className="text-2xl">👑</span>
                <div>
                  <p className="font-semibold">Platinum Tier</p>
                  <p className="text-sm text-muted-foreground">1000+ trips completed</p>
                </div>
              </div>
              <Badge variant="outline">Locked</Badge>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mt-4">
            <p className="text-sm text-blue-900">
              <strong>Tier Benefits:</strong> Unlock exclusive badges, appear on hall of fame, receive special
              invitations to GreenFlow events, and earn bonus credits on milestones.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* COMPETITIVE TIPS */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-900">🏆 Tips to Climb the Rankings</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-orange-800 space-y-2">
          <p>✅ Take more Gautrain trips—they earn 1.5x credits and boost your position faster</p>
          <p>✅ Complete weekly challenges—bonus credits help you rank up quickly</p>
          <p>✅ Refer friends—build your community and earn referral bonuses</p>
          <p>✅ Use GreenFlow consistently—consistency matters in leaderboard positioning</p>
          <p>✅ Unlock badges—rare badges give you prestige and special perks</p>
        </CardContent>
      </Card>
    </div>
  );
}
