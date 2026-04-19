import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, Target, Trophy, CheckCircle2, Lock, Clock } from "lucide-react";

interface Challenge {
  id: number;
  name: string;
  description: string;
  goal: number;
  goalType: string;
  mode?: string;
  rewardCredits: number;
  difficulty: string;
  targetDemographic: string;
  icon: string;
  progress?: number;
  completed?: boolean;
  daysRemaining?: number;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-green-600";
    case "medium":
      return "bg-blue-600";
    case "hard":
      return "bg-orange-600";
    default:
      return "bg-gray-600";
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "Easy";
    case "medium":
      return "Medium";
    case "hard":
      return "Challenge";
    default:
      return "Unknown";
  }
};

export default function Challenges() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["gamification-challenges"],
    queryFn: async () => {
      const response = await fetch("/api/gamification/challenges");
      return response.json() as Promise<Challenge[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading challenges...</p>
      </div>
    );
  }

  if (!challenges) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">Failed to load challenges</p>
      </div>
    );
  }

  const completedChallenges = challenges.filter((c) => c.completed);
  const activeChallenges = challenges.filter((c) => !c.completed);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Target className="h-8 w-8 text-orange-600" />
          Weekly Challenges
        </h1>
        <p className="text-muted-foreground">
          Complete challenges to earn bonus credits and unlock achievements
        </p>
      </div>

      {/* STATS SUMMARY */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Challenges</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeChallenges.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedChallenges.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeChallenges.reduce((sum, c) => sum + (c.rewardCredits || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Credits available</p>
          </CardContent>
        </Card>
      </div>

      {/* FEATURED ALERT */}
      <Alert className="border-orange-200 bg-orange-50">
        <Zap className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>New Challenge:</strong> "Gautrain Champion" - Take 5 Gautrain trips this week for 1000 bonus credits!
        </AlertDescription>
      </Alert>

      {/* CHALLENGES TABS */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeChallenges.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedChallenges.length})</TabsTrigger>
        </TabsList>

        {/* ACTIVE CHALLENGES */}
        <TabsContent value="active" className="space-y-4">
          {activeChallenges.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No active challenges. Check back soon!</p>
              </CardContent>
            </Card>
          ) : (
            activeChallenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{challenge.icon}</span>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {challenge.name}
                          <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white`}>
                            {getDifficultyLabel(challenge.difficulty)}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        +{challenge.rewardCredits.toLocaleString()} credits
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {challenge.progress}/{challenge.goal}{" "}
                        {challenge.goalType === "distance" ? "km" : challenge.goalType === "co2" ? "kg" : "trips"}
                      </span>
                    </div>
                    <Progress
                      value={((challenge.progress || 0) / challenge.goal) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Info and Action */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {challenge.daysRemaining} days left
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      disabled={(challenge.progress || 0) < challenge.goal}
                      className={
                        (challenge.progress || 0) >= challenge.goal
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : ""
                      }
                    >
                      {(challenge.progress || 0) >= challenge.goal ? "Claim Reward" : "In Progress"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* COMPLETED CHALLENGES */}
        <TabsContent value="completed" className="space-y-4">
          {completedChallenges.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  No completed challenges yet. Complete active challenges to see them here!
                </p>
              </CardContent>
            </Card>
          ) : (
            completedChallenges.map((challenge) => (
              <Card key={challenge.id} className="opacity-75 bg-muted/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl">{challenge.icon}</span>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {challenge.name}
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </CardTitle>
                        <CardDescription>{challenge.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">
                        +{challenge.rewardCredits.toLocaleString()} credits
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 font-semibold">✅ Challenge Completed</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* CHALLENGES GUIDE */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How Challenges Work</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            ✅ <strong>Accept a challenge:</strong> Simply start using the app. Challenges track automatically.
          </p>
          <p>
            ✅ <strong>Track progress:</strong> Watch your progress bar fill as you complete trips.
          </p>
          <p>
            ✅ <strong>Claim rewards:</strong> When the bar is full, click "Claim Reward" to earn bonus credits.
          </p>
          <p>
            ✅ <strong>Unlock achievements:</strong> Completing challenges unlocks special badges and status.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
