import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Globe,
  Users,
  Leaf,
  TrendingUp,
  Award,
  MapPin,
  Building2,
  BookOpen,
} from "lucide-react";

interface LocationStats {
  name: string;
  adoption: number;
  users: number;
  co2Saved: number;
  trips: number;
}

interface CommunityStats {
  overallMetrics: {
    totalUsers: number;
    totalCo2SavedKg: number;
    totalTrips: number;
    averageTripsPerUser: number;
    averageCo2PerTrip: number;
  };
  geographicAdoption: LocationStats[];
  employerStats: Array<{
    name: string;
    sector: string;
    employees: number;
    co2SavedKg: number;
  }>;
  studentProgram: {
    ecoAdvocates: number;
    schools: number;
    challengesCreated: number;
    studentsEngaged: number;
  };
  equityMetrics: {
    sandtonAdoption: number;
    sowetoAdoption: number;
    alexandraAdoption: number;
    equityScore: number;
  };
}

const getAdoptionColor = (adoption: number): string => {
  if (adoption >= 40) return "text-green-600";
  if (adoption >= 20) return "text-blue-600";
  if (adoption >= 10) return "text-yellow-600";
  return "text-orange-600";
};

export default function CommunityDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["community-stats"],
    queryFn: async () => {
      const response = await fetch("/api/community/stats");
      return response.json() as Promise<CommunityStats>;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading community impact data...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">Failed to load community statistics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Globe className="h-8 w-8 text-green-600" />
          Community Impact Hub
        </h1>
        <p className="text-muted-foreground">
          Track GreenFlow's inclusive reach and sustainability impact across Gauteng
        </p>
      </div>

      {/* Overall Impact Metrics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallMetrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across Gauteng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CO2 Saved</CardTitle>
            <Leaf className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.overallMetrics.totalCo2SavedKg / 1000).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">Metric tons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallMetrics.totalTrips.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Green journeys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trips/User</CardTitle>
            <BarChart3 className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overallMetrics.averageTripsPerUser.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">Per user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equity Score</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.equityMetrics.equityScore}/100</div>
            <p className="text-xs text-muted-foreground">Geographic balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="geographic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="employers">Employers</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="equity">Equity</TabsTrigger>
        </TabsList>

        {/* Geographic Adoption Tab */}
        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Adoption Across Gauteng
              </CardTitle>
              <CardDescription>
                Platform adoption and impact by region - targeting underserved areas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.geographicAdoption.map((location, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{location.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {location.users.toLocaleString()} users
                      </p>
                    </div>
                    <Badge className={`${getAdoptionColor(location.adoption)} text-white`}>
                      {location.adoption}% adoption
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex-1">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600"
                          style={{ width: `${location.adoption}%` }}
                        />
                      </div>
                    </span>
                    <span className="text-muted-foreground">
                      {location.co2Saved.toLocaleString()} kg CO2 saved
                    </span>
                  </div>
                </div>
              ))}

              {/* Key Insights */}
              <div className="mt-6 pt-4 border-t space-y-2">
                <p className="font-semibold text-sm">Key Insights:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>
                    • <strong>Sandton:</strong> 45% adoption (business hub focus)
                  </li>
                  <li>
                    • <strong>Soweto:</strong> 22% adoption (growing student engagement)
                  </li>
                  <li>
                    • <strong>Alexandra:</strong> 15% adoption (youth leadership program launching)
                  </li>
                  <li>• Focus: Expanding into underserved communities Q2-Q3 2026</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employers Tab */}
        <TabsContent value="employers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Employer Leaderboard
              </CardTitle>
              <CardDescription>
                Companies driving sustainable mobility for their employees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.employerStats.slice(0, 5).map((employer, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg text-yellow-600">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{employer.name}</p>
                        <p className="text-sm text-muted-foreground">{employer.sector}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {employer.employees.toLocaleString()} employees
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {employer.co2SavedKg.toLocaleString()} kg CO2
                    </Badge>
                    {index === 0 && <p className="text-xs text-yellow-600 mt-2">🏆 Leader</p>}
                  </div>
                </div>
              ))}

              {/* Call to Action */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-blue-900">
                  Is your company ready to lead sustainable mobility?
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  Join the employer program and get 2x green credits for your team's trips.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Green Leaders Initiative
              </CardTitle>
              <CardDescription>
                Student-led programs for sustainable mobility across Gauteng schools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.studentProgram.ecoAdvocates}
                    </div>
                    <p className="text-sm text-muted-foreground">Eco Advocates</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.studentProgram.schools}
                    </div>
                    <p className="text-sm text-muted-foreground">Schools</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-purple-600">
                      {stats.studentProgram.challengesCreated}
                    </div>
                    <p className="text-sm text-muted-foreground">Challenges</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-indigo-600">
                      {stats.studentProgram.studentsEngaged.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">Students Engaged</p>
                  </CardContent>
                </Card>
              </div>

              {/* Student Badges */}
              <div className="space-y-3 mt-6">
                <p className="font-semibold text-sm">Student Achievement Badges:</p>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <span className="text-2xl">🌱</span>
                    <div>
                      <p className="font-medium text-sm">Eco Advocate</p>
                      <p className="text-xs text-muted-foreground">Earned by 234 students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <span className="text-2xl">🚂</span>
                    <div>
                      <p className="font-medium text-sm">Gautrain Champion</p>
                      <p className="text-xs text-muted-foreground">Earned by 156 students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <span className="text-2xl">👥</span>
                    <div>
                      <p className="font-medium text-sm">Community Leader</p>
                      <p className="text-xs text-muted-foreground">Earned by 89 students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded">
                    <span className="text-2xl">♻️</span>
                    <div>
                      <p className="font-medium text-sm">Carbon Saver</p>
                      <p className="text-xs text-muted-foreground">Earned by 45 students</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Schools */}
              <div className="space-y-3 mt-6 pt-6 border-t">
                <p className="font-semibold text-sm">Active School Programs:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Wits University - Braamfontein</span>
                    <Badge variant="secondary">45 advocates</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Soweto South High - Soweto</span>
                    <Badge variant="secondary">28 advocates</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Alexander High - Alexandra</span>
                    <Badge variant="secondary">21 advocates</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equity Metrics Tab */}
        <TabsContent value="equity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Geographic Equity Analysis
              </CardTitle>
              <CardDescription>
                Measuring inclusive innovation across Gauteng neighborhoods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Adoption Comparison */}
              <div className="space-y-4">
                <p className="font-semibold text-sm">Adoption by Area:</p>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Sandton (Business Hub)</span>
                      <span className="font-semibold">{stats.equityMetrics.sandtonAdoption}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{ width: `${stats.equityMetrics.sandtonAdoption}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Soweto (Growing Adoption)</span>
                      <span className="font-semibold">{stats.equityMetrics.sowetoAdoption}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${stats.equityMetrics.sowetoAdoption}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">Alexandra (Expansion Focus)</span>
                      <span className="font-semibold">{stats.equityMetrics.alexandraAdoption}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-600"
                        style={{ width: `${stats.equityMetrics.alexandraAdoption}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Equity Score Explanation */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Equity Score: {stats.equityMetrics.equityScore}/100
                </p>
                <p className="text-sm text-green-800 mt-2">
                  Perfect balance would be 25% each area. Our current score reflects our focus on expanding into
                  underserved communities while maintaining strong adoption in business districts.
                </p>
              </div>

              {/* Strategic Initiatives */}
              <div className="space-y-3">
                <p className="font-semibold text-sm">Inclusive Innovation Initiatives:</p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>
                    ✅ <strong>Student Eco-Advocates:</strong> 342 student leaders across 18 schools driving
                    adoption in their communities
                  </li>
                  <li>
                    ✅ <strong>Youth Leadership Program:</strong> Launching in Alexandra Q2 2026, targeting 250 youth
                    participants
                  </li>
                  <li>
                    ✅ <strong>Employer Incentives:</strong> Companies getting 2x credits for employee trips to drive
                    adoption
                  </li>
                  <li>
                    ✅ <strong>Off-Peak Affordability:</strong> Double rewards during off-peak hours for underserved
                    areas
                  </li>
                  <li>
                    ✅ <strong>Community Ambassadors:</strong> Recruiting local leaders to champion GreenFlow in their
                    neighborhoods
                  </li>
                </ul>
              </div>

              {/* Growth Trajectory */}
              <div className="space-y-3 pt-4 border-t">
                <p className="font-semibold text-sm">Growth Trajectory Q2 2026:</p>
                <div className="text-sm space-y-2 text-muted-foreground">
                  <p>
                    📈 Target Soweto adoption: <strong>35%</strong> (from 22%)
                  </p>
                  <p>
                    📈 Target Alexandra adoption: <strong>25%</strong> (from 15%)
                  </p>
                  <p>
                    📈 Target Equity Score: <strong>72/100</strong> (more balanced distribution)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Message */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <p className="text-sm font-semibold text-gray-900">
            💚 GreenFlow is committed to inclusive innovation across all of Gauteng, not just tech hubs.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Every community gets access to the same tools for sustainable mobility. We measure success not just by
            adoption, but by reaching those who need it most.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
