export interface FoodLog {
  logId: string;
  userId: string;
  foodName: string;
  portion: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  consumedAt: Date;
  mealType: string;
  createdAt: Date;
  updatedAt: Date;
}
