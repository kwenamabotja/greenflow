import { Router, Request, Response } from "express";
import { logger } from "../lib/logger.js";

const router = Router();

// Define types for gamification data
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

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  tier: string;
  rarity: string;
  earned?: boolean;
  unlockedAt?: string;
}

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  totalTrips: number;
  totalCo2SavedKg: number;
  greenCreditsEarned: number;
  badgesEarned: number;
  topMode: string;
}

/**
 * GET /api/gamification/challenges
 * Get all active challenges
 */
router.get("/challenges", (req: Request, res: Response) => {
  try {
    const challenges: Challenge[] = [
      {
        id: 1,
        name: "Gautrain Champion",
        description: "Take 5 Gautrain trips in one week",
        goal: 5,
        goalType: "mode_trips",
        mode: "gautrain",
        rewardCredits: 1000,
        difficulty: "hard",
        targetDemographic: "all",
        icon: "🚂",
        progress: 2,
        completed: false,
        daysRemaining: 5,
      },
      {
        id: 2,
        name: "Metrobus Maven",
        description: "Complete 10 bus trips this month",
        goal: 10,
        goalType: "mode_trips",
        mode: "metrobus",
        rewardCredits: 800,
        difficulty: "medium",
        targetDemographic: "all",
        icon: "🚌",
        progress: 7,
        completed: false,
        daysRemaining: 14,
      },
      {
        id: 3,
        name: "Week Warrior",
        description: "Take 10 any transit trips in one week",
        goal: 10,
        goalType: "trips",
        rewardCredits: 500,
        difficulty: "medium",
        targetDemographic: "all",
        icon: "⚡",
        progress: 8,
        completed: false,
        daysRemaining: 3,
      },
      {
        id: 4,
        name: "Distance Master",
        description: "Travel 100km on public transit",
        goal: 100,
        goalType: "distance",
        rewardCredits: 750,
        difficulty: "medium",
        targetDemographic: "all",
        icon: "🗺️",
        progress: 62,
        completed: false,
        daysRemaining: 30,
      },
      {
        id: 5,
        name: "Carbon Crusader",
        description: "Save 50kg CO2 this month",
        goal: 50,
        goalType: "co2",
        rewardCredits: 600,
        difficulty: "easy",
        targetDemographic: "all",
        icon: "♻️",
        progress: 38,
        completed: false,
        daysRemaining: 12,
      },
      {
        id: 6,
        name: "Student Leader",
        description: "Recruit 5 friends to GreenFlow",
        goal: 5,
        goalType: "referrals",
        rewardCredits: 2000,
        difficulty: "hard",
        targetDemographic: "students",
        icon: "👥",
        progress: 1,
        completed: false,
        daysRemaining: 60,
      },
    ];

    logger.info({ count: challenges.length }, "Challenges retrieved");
    res.json(challenges);
  } catch (error) {
    logger.error({ error }, "Failed to get challenges");
    res.status(500).json({ error: "Failed to retrieve challenges" });
  }
});

/**
 * POST /api/gamification/challenges/:id/complete
 * Mark a challenge as completed
 */
router.post("/challenges/:id/complete", (req: Request, res: Response): any => {
  try {
    const id = req.params.id as string;
    const challengeId = parseInt(id);

    if (!challengeId || challengeId <= 0) {
      return res.status(400).json({ error: "Invalid challenge ID" });
    }

    // Mock response
    logger.info({challengeId}, `Challenge ${challengeId} completed`);
    return res.json({
      challengeId,
      completed: true,
      rewardsClaimed: 1000,
      message: "Challenge completed! Rewards claimed.",
    });
  } catch (error) {
    logger.error({ error }, "Failed to complete challenge");
    res.status(500).json({ error: "Failed to complete challenge" });
  }
});

/**
 * GET /api/gamification/badges
 * Get all badges available
 */
router.get("/badges", (req: Request, res: Response) => {
  try {
    const badges: Badge[] = [
      {
        id: 1,
        name: "Eco Advocate",
        description: "Complete 50+ trips",
        icon: "🌱",
        requirement: "50_trips",
        tier: "bronze",
        rarity: "common",
        earned: true,
        unlockedAt: "2026-04-10",
      },
      {
        id: 2,
        name: "Gautrain Champion",
        description: "Complete 10 Gautrain trips",
        icon: "🚂",
        requirement: "10_gautrain_trips",
        tier: "silver",
        rarity: "uncommon",
        earned: true,
        unlockedAt: "2026-04-15",
      },
      {
        id: 3,
        name: "Carbon Saver",
        description: "Save 1000kg CO2",
        icon: "💚",
        requirement: "1000_kg_co2",
        tier: "gold",
        rarity: "rare",
        earned: false,
      },
      {
        id: 4,
        name: "Community Leader",
        description: "Refer 5+ friends",
        icon: "👥",
        requirement: "5_referrals",
        tier: "gold",
        rarity: "rare",
        earned: false,
      },
      {
        id: 5,
        name: "Green Legend",
        description: "Earn 50,000+ credits",
        icon: "👑",
        requirement: "50000_credits",
        tier: "platinum",
        rarity: "legendary",
        earned: false,
      },
      {
        id: 6,
        name: "Mode Shifter",
        description: "Switch from private car 10 times",
        icon: "🔄",
        requirement: "car_to_transit_shifts",
        tier: "silver",
        rarity: "uncommon",
        earned: true,
        unlockedAt: "2026-04-12",
      },
    ];

    logger.info({ count: badges.length }, "Badges retrieved");
    res.json(badges);
  } catch (error) {
    logger.error({ error }, "Failed to get badges");
    res.status(500).json({ error: "Failed to retrieve badges" });
  }
});

/**
 * POST /api/gamification/badges/:id/claim
 * Claim a badge reward
 */
router.post("/badges/:id/claim", (req: Request, res: Response): any => {
  try {
    const id = req.params.id as string;
    const badgeId = parseInt(id);

    if (!badgeId || badgeId <= 0) {
      return res.status(400).json({ error: "Invalid badge ID" });
    }

    logger.info({badgeId}, `Badge ${badgeId} claimed`);
    return res.json({
      badgeId,
      claimed: true,
      message: "Badge claimed! Check your profile.",
    });
  } catch (error) {
    logger.error({ error }, "Failed to claim badge");
    res.status(500).json({ error: "Failed to claim badge" });
  }
});

/**
 * GET /api/gamification/leaderboards
 * Get leaderboards by scope
 */
router.get("/leaderboards", (req: Request, res: Response) => {
  try {
    const { scope = "global" } = req.query; // global, employer, school, neighborhood

    const leaderboards: Record<string, LeaderboardEntry[]> = {
      global: [
        {
          rank: 1,
          displayName: "Thabo Mkhize",
          totalTrips: 342,
          totalCo2SavedKg: 512,
          greenCreditsEarned: 15650,
          badgesEarned: 6,
          topMode: "gautrain",
        },
        {
          rank: 2,
          displayName: "Amara Okonkwo",
          totalTrips: 298,
          totalCo2SavedKg: 445,
          greenCreditsEarned: 13240,
          badgesEarned: 5,
          topMode: "metrobus",
        },
        {
          rank: 3,
          displayName: "Sarah Chen",
          totalTrips: 267,
          totalCo2SavedKg: 401,
          greenCreditsEarned: 11890,
          badgesEarned: 4,
          topMode: "gautrain",
        },
      ],
      employer: [
        {
          rank: 1,
          displayName: "Rajesh Patel",
          totalTrips: 185,
          totalCo2SavedKg: 278,
          greenCreditsEarned: 8900,
          badgesEarned: 3,
          topMode: "gautrain",
        },
        {
          rank: 2,
          displayName: "Nomsa Dlamini",
          totalTrips: 156,
          totalCo2SavedKg: 234,
          greenCreditsEarned: 7200,
          badgesEarned: 3,
          topMode: "metrobus",
        },
        {
          rank: 3,
          displayName: "James Murphy",
          totalTrips: 142,
          totalCo2SavedKg: 213,
          greenCreditsEarned: 6400,
          badgesEarned: 2,
          topMode: "virtual_taxi",
        },
      ],
      school: [
        {
          rank: 1,
          displayName: "Zama Ntuli",
          totalTrips: 98,
          totalCo2SavedKg: 147,
          greenCreditsEarned: 4560,
          badgesEarned: 2,
          topMode: "virtual_taxi",
        },
        {
          rank: 2,
          displayName: "Keabetsoe Mokgosi",
          totalTrips: 87,
          totalCo2SavedKg: 130,
          greenCreditsEarned: 3890,
          badgesEarned: 2,
          topMode: "metrobus",
        },
        {
          rank: 3,
          displayName: "Lindiwe Khumalo",
          totalTrips: 76,
          totalCo2SavedKg: 114,
          greenCreditsEarned: 3450,
          badgesEarned: 1,
          topMode: "metrobus",
        },
      ],
    };

    const result = leaderboards[scope as string] || leaderboards.global;

    logger.info(`Leaderboard retrieved: ${scope}`);
    res.json({
      scope,
      leaderboard: result,
      message: `Top performers in ${scope}`,
    });
  } catch (error) {
    logger.error({ error }, "Failed to get leaderboards");
    res.status(500).json({ error: "Failed to retrieve leaderboards" });
  }
});

/**
 * GET /api/gamification/user/progress
 * Get current user's progress
 */
router.get("/user/progress", (req: Request, res: Response) => {
  try {
    const userProgress = {
      displayName: "You",
      totalTrips: 156,
      totalCo2SavedKg: 234,
      greenCreditsEarned: 7200,
      badgesEarned: 3,
      globalRank: 245,
      employerRank: 12,
      challengesCompleted: 2,
      challengesActive: 4,
      nextMilestone: {
        name: "100 trips",
        progress: 156,
        remaining: 100,
      },
      recentAchievements: [
        {
          type: "badge",
          name: "Mode Shifter",
          icon: "🔄",
          unlockedAt: "2 days ago",
        },
        {
          type: "challenge",
          name: "Week Warrior",
          icon: "⚡",
          completedAt: "1 week ago",
          reward: 500,
        },
      ],
    };

    logger.info("User progress retrieved");
    res.json(userProgress);
  } catch (error) {
    logger.error({ error }, "Failed to get user progress");
    res.status(500).json({ error: "Failed to retrieve user progress" });
  }
});

/**
 * GET /api/gamification/stats
 * Get gamification stats for dashboard
 */
router.get("/stats", (req: Request, res: Response) => {
  try {
    const stats = {
      totalUsers: 12847,
      totalChallengesCompleted: 34521,
      totalBadgesEarned: 28904,
      averageChallengesPerUser: 2.68,
      averageBadgesPerUser: 2.25,
      engagementRate: 0.78, // 78% of users engaged in gamification
      mostCompletedChallenge: {
        name: "Week Warrior",
        completions: 8900,
        icon: "⚡",
      },
      rariestBadge: {
        name: "Green Legend",
        earners: 42,
        rarity: "legendary",
        icon: "👑",
      },
      topPerformers: [
        {
          rank: 1,
          displayName: "Thabo Mkhize",
          score: 342 + 512 + 6, // trips + co2 + badges
          totalTrips: 342,
        },
      ],
    };

    res.json(stats);
  } catch (error) {
    logger.error({ error }, "Failed to get gamification stats");
    res.status(500).json({ error: "Failed to retrieve stats" });
  }
});

export default router;
