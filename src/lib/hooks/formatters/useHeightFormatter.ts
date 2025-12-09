import { UNIT_CONVERSIONS } from '../../theme/constants';
import { UnitSystem } from '../../types/Onboarding';
import { useUnitFormatter, UnitFormatter } from './useUnitFormatter';

const CM_TO_INCHES = 1 / UNIT_CONVERSIONS.CM_PER_INCH;

export const useHeightFormatter = (
  unitSystem: UnitSystem
): UnitFormatter<'metric' | 'imperial'> & {
  toFeetAndInches: (heightCm: number) => { feet: number; inches: number };
  fromFeetAndInches: (feet: number, inches: number) => number;
} => {
  // Use the generic unit formatter for basic cm ↔ inches conversion
  const baseFormatter = useUnitFormatter(
    unitSystem === UnitSystem.METRIC ? 'metric' : 'imperial',
    {
      metricUnit: 'cm',
      imperialUnit: 'in',
      metricToImperialFactor: CM_TO_INCHES,
      decimalPlaces: 0,
    }
  );

  // Helper: Convert cm to feet and inches
  const toFeetAndInches = (heightCm: number): { feet: number; inches: number } => {
    const totalInches = heightCm / UNIT_CONVERSIONS.CM_PER_INCH;
    const feet = Math.floor(totalInches / UNIT_CONVERSIONS.INCHES_PER_FOOT);
    const inches = Math.round(totalInches % UNIT_CONVERSIONS.INCHES_PER_FOOT);

    return { feet, inches };
  };

  // Helper: Convert feet and inches to cm
  const fromFeetAndInches = (feet: number, inches: number): number => {
    return (
      feet * UNIT_CONVERSIONS.CM_PER_FOOT +
      inches * UNIT_CONVERSIONS.CM_PER_INCH
    );
  };

  // Override format for imperial to show feet and inches
  const format = (heightCm: number): string => {
    if (unitSystem === UnitSystem.METRIC) {
      return baseFormatter.format(heightCm);
    } else {
      const { feet, inches } = toFeetAndInches(heightCm);
      return `${feet}' ${inches}"`;
    }
  };

  return {
    format,
    getValue: baseFormatter.getValue,
    toBaseUnit: baseFormatter.toBaseUnit,
    getUnitLabel: baseFormatter.getUnitLabel,
    toFeetAndInches,
    fromFeetAndInches,
  };
};
