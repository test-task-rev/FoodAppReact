import { useUnitFormatter, UnitFormatter, UnitSystem } from './useUnitFormatter';

const KG_TO_LBS = 2.20462;

export const useWeightFormatter = (
  unitSystem: UnitSystem
): UnitFormatter<UnitSystem> => {
  return useUnitFormatter(unitSystem, {
    metricUnit: 'kg',
    imperialUnit: 'lbs',
    metricToImperialFactor: KG_TO_LBS,
    decimalPlaces: 1,
  });
};
