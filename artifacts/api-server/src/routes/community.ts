import { Router, Request, Response } from "express";
import { logger } from "../lib/logger.js";

const router = Router();

interface LocationStats {
  name: string;
  latitude: number;
  longitude: number;
  adoption: number; // percentage
  users: number;
  co2Saved: number;
  trips: number;
}

interface EmployerStats {
  name: string;
  sector: string;
  employees: number;
  co2SavedKg: number;
  tripsPerEmployee: number;
  topMode: string;
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
  employerStats: EmployerStats[];
  studentProgram: {
    ecoAdvocates: number;
    schools: number;
    challengesCreated: number;
    studentsEngaged: number;
  };
  equityMetrics: {
    sandtonAdoption: number; // percentage
    sowetoAdoption: number;
    alexandraAdoption: number;
    otherAdoption: number;
    equityScore: number; // 0-100: higher = more balanced adoption
  };
  impactTimeline: Array<{
    month: string;
    newUsers: number;
    co2Saved: number;
    trips: number;
  }>;
}

/**
 * GET /api/community/stats
 * Get community-wide impact statistics and geographic adoption metrics
 */
router.get("/stats", (req: Request, res: Response) => {
  try {
    // Mock data for demonstration
    // In production, this would query the database
    const stats: CommunityStats = {
      overallMetrics: {
        totalUsers: 12847,
        totalCo2SavedKg: 156230,
        totalTrips: 89456,
        averageTripsPerUser: 6.96,
        averageCo2PerTrip: 1.75,
      },
      geographicAdoption: [
        {
          name: "Sandton",
          latitude: -26.1076,
          longitude: 28.0567,
          adoption: 45,
          users: 5781,
          co2Saved: 78450,
          trips: 34521,
        },
        {
          name: "Soweto",
          latitude: -26.2344,
          longitude: 27.8738,
          adoption: 22,
          users: 2826,
          co2Saved: 38230,
          trips: 18956,
        },
        {
          name: "Alexandra",
          latitude: -25.8833,
          longitude: 28.0333,
          adoption: 15,
          users: 1927,
          co2Saved: 19340,
          trips: 12134,
        },
        {
          name: "Midrand",
          latitude: -25.9858,
          longitude: 28.1156,
          adoption: 12,
          users: 1541,
          co2Saved: 12840,
          trips: 11234,
        },
        {
          name: "Pretoria CBD",
          latitude: -25.7461,
          longitude: 28.2203,
          adoption: 4,
          users: 514,
          co2Saved: 5120,
          trips: 3810,
        },
        {
          name: "Roodepoort",
          latitude: -26.1847,
          longitude: 27.8469,
          adoption: 2,
          users: 257,
          co2Saved: 2250,
          trips: 1801,
        },
      ],
      employerStats: [
        {
          name: "Deloitte Sandton",
          sector: "Consulting",
          employees: 1250,
          co2SavedKg: 15430,
          tripsPerEmployee: 8.2,
          topMode: "gautrain",
        },
        {
          name: "Microsoft Midrand",
          sector: "Technology",
          employees: 850,
          co2SavedKg: 12340,
          tripsPerEmployee: 7.5,
          topMode: "metrobus",
        },
        {
          name: "Wits University",
          sector: "Education",
          employees: 3200,
          co2SavedKg: 28560,
          tripsPerEmployee: 5.8,
          topMode: "virtual_taxi",
        },
        {
          name: "Standard Bank Rosebank",
          sector: "Finance",
          employees: 950,
          co2SavedKg: 14560,
          tripsPerEmployee: 6.9,
          topMode: "gautrain",
        },
        {
          name: "Johannesburg Water",
          sector: "Public Services",
          employees: 480,
          co2SavedKg: 5230,
          tripsPerEmployee: 6.1,
          topMode: "metrobus",
        },
      ],
      studentProgram: {
        ecoAdvocates: 342,
        schools: 18,
        challengesCreated: 47,
        studentsEngaged: 4521,
      },
      equityMetrics: {
        sandtonAdoption: 45,
        sowetoAdoption: 22,
        alexandraAdoption: 15,
        otherAdoption: 18,
        equityScore: 58, // Out of 100: 25 each area would be perfect balance
      },
      impactTimeline: [
        { month: "Dec 2025", newUsers: 1250, co2Saved: 12340, trips: 8900 },
        { month: "Jan 2026", newUsers: 1840, co2Saved: 18560, trips: 12340 },
        { month: "Feb 2026", newUsers: 2130, co2Saved: 22450, trips: 15670 },
        { month: "Mar 2026", newUsers: 3245, co2Saved: 41230, trips: 28340 },
        { month: "Apr 2026", newUsers: 4382, co2Saved: 61670, trips: 24206 },
      ],
    };

    logger.info({ totalUsers: stats.overallMetrics.totalUsers, locationsTracked: stats.geographicAdoption.length }, "Community stats retrieved");

    res.json(stats);
  } catch (error) {
    logger.error({ error }, "Failed to get community stats");
    res.status(500).json({ error: "Failed to retrieve community statistics" });
  }
});

/**
 * GET /api/community/geographic-details/:area
 * Get detailed metrics for a specific geographic area
 */
router.get("/geographic-details/:area", (req: Request, res: Response) => {
  const { area } = req.params;

  const areaDetails: Record<
    string,
    {
      name: string;
      description: string;
      demographics: string;
      targetPrograms: string[];
      initiatives: Array<{ name: string; status: string; impact: string }>;
    }
  > = {
    sandton: {
      name: "Sandton",
      description: "Business district with high corporate adoption",
      demographics: "Business professionals, corporate employees",
      targetPrograms: ["Employer incentives", "Corporate challenges"],
      initiatives: [
        {
          name: "Sandton Corporate Challenge",
          status: "Active",
          impact: "2,850 employees participating",
        },
        {
          name: "Midweek Gautrain Sprint",
          status: "Active",
          impact: "1,230 commuters engaged",
        },
      ],
    },
    soweto: {
      name: "Soweto",
      description: "Growing adoption with focus on affordability",
      demographics: "Students, working-class commuters, families",
      targetPrograms: ["Student advocacy", "Affordability rewards", "Community ambassadors"],
      initiatives: [
        {
          name: "Soweto Eco-Advocates Program",
          status: "Active",
          impact: "89 student leaders, 1,200+ engaged",
        },
        {
          name: "Virtual Taxi Co-op Incentive",
          status: "Planned",
          impact: "Expected: 500+ new users",
        },
      ],
    },
    alexandra: {
      name: "Alexandra",
      description: "Focus on inclusive innovation and accessibility",
      demographics: "Youth, informal settlers, low-income earners",
      targetPrograms: ["Youth leadership", "Accessibility first", "Community partnerships"],
      initiatives: [
        {
          name: "Alexandra Youth Green Leaders",
          status: "Launch Q2 2026",
          impact: "Target: 250 youth participants",
        },
        {
          name: "Off-peak affordability program",
          status: "Pilot",
          impact: "2x rewards during off-peak hours",
        },
      ],
    },
  };

  const area_lower = typeof area === "string" ? area.toLowerCase() : "";
  const details = areaDetails[area_lower];

  if (!details) {
    return res.status(404).json({ error: "Area not found" });
  }

  logger.info({area}, `Geographic details retrieved for ${area}`);
  return res.json(details);
});

/**
 * GET /api/community/employer-leaderboard
 * Get employer rankings by CO2 saved
 */
router.get("/employer-leaderboard", (req: Request, res: Response) => {
  try {
    const leaderboard = [
      {
        rank: 1,
        name: "Wits University",
        co2SavedKg: 28560,
        employees: 3200,
        avgPerEmployee: 8.92,
        badge: "🏆 Sustainability Champion",
      },
      {
        rank: 2,
        name: "Deloitte Sandton",
        co2SavedKg: 15430,
        employees: 1250,
        avgPerEmployee: 12.34,
        badge: "🌟 Top Performer",
      },
      {
        rank: 3,
        name: "Standard Bank Rosebank",
        co2SavedKg: 14560,
        employees: 950,
        avgPerEmployee: 15.33,
        badge: "🌱 Growth Leader",
      },
      {
        rank: 4,
        name: "Microsoft Midrand",
        co2SavedKg: 12340,
        employees: 850,
        avgPerEmployee: 14.52,
        badge: "💡 Innovation First",
      },
      {
        rank: 5,
        name: "Johannesburg Water",
        co2SavedKg: 5230,
        employees: 480,
        avgPerEmployee: 10.90,
        badge: "🎯 Rising Star",
      },
    ];

    res.json(leaderboard);
  } catch (error) {
    logger.error({ error }, "Failed to get employer leaderboard");
    res.status(500).json({ error: "Failed to retrieve leaderboard" });
  }
});

/**
 * GET /api/community/student-program
 * Get student eco-advocate program details
 */
router.get("/student-program", (req: Request, res: Response) => {
  try {
    const programData = {
      name: "Green Leaders Initiative",
      description:
        "Student-led program to promote sustainable mobility across Gauteng schools",
      stats: {
        ecoAdvocates: 342,
        schools: 18,
        challengesCreated: 47,
        studentsEngaged: 4521,
        co2AvoidedKg: 12340,
      },
      badges: [
        {
          id: "eco-advocate",
          name: "Eco Advocate",
          description: "50+ trips completed",
          earners: 234,
        },
        {
          id: "gautrain-champion",
          name: "Gautrain Champion",
          description: "10+ Gautrain trips",
          earners: 156,
        },
        {
          id: "community-leader",
          name: "Community Leader",
          description: "Referred 5+ friends",
          earners: 89,
        },
        {
          id: "carbon-saver",
          name: "Carbon Saver",
          description: "1000+ kg CO2 saved",
          earners: 45,
        },
      ],
      schoolProgramsByArea: [
        {
          school: "Wits University",
          area: "Braamfontein",
          advocates: 45,
          studentsEngaged: 650,
          topInitiative: "Campus Sustainability Challenge",
        },
        {
          school: "Soweto South High",
          area: "Soweto",
          advocates: 28,
          studentsEngaged: 380,
          topInitiative: "Green Commute Challenge",
        },
        {
          school: "Alexander High",
          area: "Alexandra",
          advocates: 21,
          studentsEngaged: 280,
          topInitiative: "Youth Leadership Program",
        },
        {
          school: "Midrand High",
          area: "Midrand",
          advocates: 18,
          studentsEngaged: 240,
          topInitiative: "School Shuttle Initiative",
        },
      ],
    };

    res.json(programData);
  } catch (error) {
    logger.error({ error }, "Failed to get student program data");
    res.status(500).json({ error: "Failed to retrieve student program data" });
  }
});

export default router;
