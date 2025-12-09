export interface WaterLog {
  logId: string;
  userId: string;
  amount: number;
  consumedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const convertMlToFlOz = (ml: number): number => ml * 0.033814;
export const convertFlOzToMl = (flOz: number): number => flOz * 29.5735;
