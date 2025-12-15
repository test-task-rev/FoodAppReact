import { useUnitFormatter, UnitFormatter } from './useUnitFormatter';

export type VolumeUnit = 'metric' | 'imperial';
export type VolumeFormatter = UnitFormatter<VolumeUnit>;

const ML_TO_FLOZ = 0.033814;

export const useVolumeFormatter = (
  unitSystem: VolumeUnit = 'metric'
): UnitFormatter<VolumeUnit> => {
  return useUnitFormatter(unitSystem, {
    metricUnit: 'ml',
    imperialUnit: 'fl oz',
    metricToImperialFactor: ML_TO_FLOZ,
    decimalPlaces: 0,
  });
};
