export interface WeightEntry {
  id: number; // ID from backend (required - all entries come from backend)
  weight: number; // in kg
  date: Date;
}

export const convertKgToLbs = (kg: number): number => kg * 2.20462;
export const convertLbsToKg = (lbs: number): number => lbs / 2.20462;
