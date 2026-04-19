const PRIVATE_CAR_EMISSIONS_G_PER_KM = 120;

const MODE_EMISSIONS_G_PER_KM: Record<string, number> = {
  virtual_taxi: 35,
  gautrain: 28,
  metrobus: 42,
  private_car: 120,
};

export function calculateCarbonSavings(distanceKm: number, mode: string) {
  const modeEmissions = MODE_EMISSIONS_G_PER_KM[mode] ?? 35;
  const privateCarEmissionsG = distanceKm * PRIVATE_CAR_EMISSIONS_G_PER_KM;
  const actualEmissionsG = distanceKm * modeEmissions;
  const savedCo2G = privateCarEmissionsG - actualEmissionsG;
  const savedCo2Kg = savedCo2G / 1000;
  const greenCreditsEarned = Math.max(1, Math.round(savedCo2G / 100));
  const equivalentTreeDays = savedCo2Kg / 0.022;

  return {
    distanceKm,
    mode,
    privateCarEmissionsG: Math.round(privateCarEmissionsG),
    actualEmissionsG: Math.round(actualEmissionsG),
    savedCo2G: Math.round(savedCo2G),
    savedCo2Kg: Math.round(savedCo2Kg * 100) / 100,
    greenCreditsEarned,
    equivalentTreeDays: Math.round(equivalentTreeDays * 10) / 10,
  };
}
