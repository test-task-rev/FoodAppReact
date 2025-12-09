/**
 * Generic unit formatter hook
 * Provides conversion and formatting for different unit systems
 */

export type UnitSystem = 'metric' | 'imperial';

export interface UnitFormatter<T extends string> {
  format: (value: number) => string;
  getValue: (value: number) => number;
  toBaseUnit: (displayValue: number) => number;
  getUnitLabel: () => string;
}

interface UnitConfig<T extends string> {
  metricUnit: string;
  imperialUnit: string;
  metricToImperialFactor: number;
  decimalPlaces?: number;
}

export function useUnitFormatter<T extends string>(
  unitSystem: T,
  config: UnitConfig<T>
): UnitFormatter<T> {
  const isMetric = unitSystem === 'metric';
  const {
    metricUnit,
    imperialUnit,
    metricToImperialFactor,
    decimalPlaces = 0,
  } = config;

  /**
   * Formats a value in base units to a display string
   * @param baseValue Value in base units (kg, ml, etc.)
   * @returns Formatted string with unit label
   */
  const format = (baseValue: number): string => {
    const displayValue = getValue(baseValue);
    const roundedValue =
      decimalPlaces === 0
        ? Math.round(displayValue)
        : Number(displayValue.toFixed(decimalPlaces));

    return `${roundedValue} ${getUnitLabel()}`;
  };

  /**
   * Converts base value to display value (metric or imperial)
   * @param baseValue Value in base units
   * @returns Value in user's preferred unit system
   */
  const getValue = (baseValue: number): number => {
    return isMetric ? baseValue : baseValue * metricToImperialFactor;
  };

  /**
   * Converts display value back to base units
   * @param displayValue Value in user's unit system
   * @returns Value in base units (for storage/API)
   */
  const toBaseUnit = (displayValue: number): number => {
    return isMetric ? displayValue : displayValue / metricToImperialFactor;
  };

  /**
   * Gets the unit label for the current system
   * @returns Unit label (kg, lbs, ml, fl oz, etc.)
   */
  const getUnitLabel = (): string => {
    return isMetric ? metricUnit : imperialUnit;
  };

  return {
    format,
    getValue,
    toBaseUnit,
    getUnitLabel,
  };
}
