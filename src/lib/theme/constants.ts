/**
 * UI Constants - Magic numbers extracted for maintainability
 */

// Progress Ring Sizes
export const RING_SIZES = {
  LARGE: 140,
  MEDIUM: 90,
} as const;

// Stroke Widths
export const STROKE_WIDTHS = {
  LARGE_RING: 13,
  MEDIUM_RING: 8,
  STROKE_WIDTH_RATIO: 0.093, // Proportional stroke width calculation
} as const;

// Icon Sizes
export const ICON_SIZES = {
  EXTRA_LARGE: 56, // FAB button icon
  LARGE: 48,       // Water icon, Empty state icons
  MEDIUM: 28,      // Add buttons
  SMALL: 24,       // Header icons
  EXTRA_SMALL: 20, // List icons
  TINY: 18,        // Inline icons
  MINI: 16,        // Small icons
  MICRO: 14,       // Chevrons
} as const;

// Component Heights
export const COMPONENT_HEIGHTS = {
  PROGRESS_BAR: 40,
  TAB_BAR_ICON: 60,
} as const;

// Page Indicator
export const PAGE_INDICATOR = {
  DOT_SIZE: 6,
} as const;

// Water Serving Sizes (ml)
export const WATER_SERVING_SIZES = [100, 150, 200, 250, 500, 750, 1000] as const;

// Default Goals
export const DEFAULT_GOALS = {
  WATER: 2000,      // ml
  CALORIES: 2300,   // kcal
  PROTEIN: 150,     // g
  CARBS: 250,       // g
  FAT: 70,          // g
} as const;

// Time Periods
export const TIME_PERIODS = {
  SEVEN_DAYS: 7,
  THIRTY_DAYS: 30,
  NINETY_DAYS: 90,
} as const;

// Unit Conversions
export const UNIT_CONVERSIONS = {
  CM_PER_INCH: 2.54,
  INCHES_PER_FOOT: 12,
  CM_PER_FOOT: 30.48, // 2.54 * 12
} as const;
