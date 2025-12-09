import { useUnitFormatter, UnitFormatter, UnitSystem } from './useUnitFormatter';

const GRAMS_TO_OZ = 0.035274;

export const usePortionFormatter = (
  unitSystem: UnitSystem
): UnitFormatter<UnitSystem> => {
  return useUnitFormatter(unitSystem, {
    metricUnit: 'g',
    imperialUnit: 'oz',
    metricToImperialFactor: GRAMS_TO_OZ,
    decimalPlaces: 1,
  });
};
