// Domain model for food items
export interface FoodItem {
  foodId: string;
  foodName: string;
  language: string;
  portion: number;       // Amount in the unit specified
  unit: string;          // e.g., "grams", "oz", "ml"
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  code?: string;         // Barcode (optional)
  brand?: string;        // Brand name (optional)
}

// Backend response format (from /food/search endpoint)
export interface FoodItemResponse {
  foodId: string;
  foodName: string;
  language: string;
  portion: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  code?: string;
  brand?: string;
}

// Backend response format (from /barcodes/{code} endpoint)
export interface BarcodeFoodItemResponse {
  foodId: string;
  foodName: string;
  language: string;
  portion: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  code?: string;
  brand?: string;
}
