import { Gender, ActivityLevel, UnitSystem } from './Onboarding';

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  birthdate: string; // ISO format: "YYYY-MM-DD"
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  unitSystem: UnitSystem;
}

export interface UpdateProfileRequest {
  displayName: string;
  birthdate: string;
  gender: string;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  unitSystem: string;
}
