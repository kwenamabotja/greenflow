const PRIVATE_CAR_EMISSIONS_G_PER_KM = 120;

const MODE_EMISSIONS_G_PER_KM: Record<string, number> = {
  virtual_taxi: 35,
  gautrain: 28,
  metrobus: 42,
  private_car: 120,
};

// Transit preference incentives: multiply credits by mode
// Highest incentive for most sustainable modes
const MODE_CREDIT_MULTIPLIER: Record<string, number> = {
  gautrain: 1.5, // Most sustainable (rail, high capacity)
  metrobus: 1.2, // Very sustainable (bus, high capacity)
  virtual_taxi: 1.0, // Baseline (shared taxi)
  private_car: 0, // Not incentivized
  walking: 0, // Already incentivized by health
  cycling: 0, // Already incentivized by health
  mixed: 1.0, // Multimodal trips
};

export function getModeMultiplier(mode: string): number {
  return MODE_CREDIT_MULTIPLIER[mode] ?? 1.0;
}

export function getModeEmissionFactor(mode: string): number {
  return MODE_EMISSIONS_G_PER_KM[mode] ?? 120;
}

export function calculateCarbonSavings(distanceKm: number, mode: string) {
  const actualDistance = Math.max(0, distanceKm); // Handle negative/zero
  
  const modeEmissions = MODE_EMISSIONS_G_PER_KM[mode] ?? 35;
  const privateCarEmissionsG = actualDistance * PRIVATE_CAR_EMISSIONS_G_PER_KM;
  const actualEmissionsG = actualDistance * modeEmissions;
  const savedCo2G = privateCarEmissionsG - actualEmissionsG;
  const savedCo2Kg = savedCo2G / 1000;
  const baseCredits = Math.max(0, Math.round(savedCo2G / 100));
  const multiplier = getModeMultiplier(mode);
  const greenCreditsEarned = Math.round(baseCredits * multiplier);
  const equivalentTreeDays = savedCo2Kg / 0.022;

  return {
    distanceKm: actualDistance,
    mode,
    privateCarEmissionsG: Math.round(privateCarEmissionsG),
    actualEmissionsG: Math.round(actualEmissionsG),
    savedCo2G: Math.round(savedCo2G),
    savedCo2Kg: Math.round(savedCo2Kg * 100) / 100,
    baseCredits,
    multiplier,
    greenCreditsEarned,
    equivalentTreeDays: Math.round(equivalentTreeDays * 10) / 10,
  };
}

export function calculateMultimodalCarbon(legs: Array<{ distance: number; mode: string }>): number {
  if (!legs || legs.length === 0) return 0;
  
  let totalSavedCo2G = 0;
  
  for (const leg of legs) {
    const result = calculateCarbonSavings(leg.distance, leg.mode);
    totalSavedCo2G += result.savedCo2G;
  }
  
  return totalSavedCo2G;
}
