import { useState, useCallback, useRef, useEffect } from 'react';
import { useApi } from './useApi';
import { FoodItem, FoodItemResponse, BarcodeFoodItemResponse } from '../types/FoodItem';
import { API_URLS } from '../config/api';

// Parse backend response to domain model
const parseFoodItem = (raw: FoodItemResponse | BarcodeFoodItemResponse): FoodItem => {
  return {
    foodId: raw.foodId,
    foodName: raw.foodName,
    language: raw.language,
    portion: raw.portion,
    unit: raw.unit,
    calories: raw.calories,
    protein: raw.protein,
    carbohydrates: raw.carbohydrates,
    fat: raw.fat,
    code: raw.code,
    brand: raw.brand,
  };
};

const formatError = (err: unknown, defaultMessage: string): string => {
  return err instanceof Error ? err.message : defaultMessage;
};

interface UseFoodSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  limit?: number;
}

export const useFoodSearch = ({
  debounceMs = 500,
  minQueryLength = 2,
  limit = 20,
}: UseFoodSearchOptions = {}) => {
  const api = useApi(API_URLS.FOOD_SERVICE);

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Search for food items by query string
   */
  const searchFoodItems = useCallback(
    async (query: string): Promise<void> => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsSearching(true);
      setError(null);

      try {
        const encodedQuery = encodeURIComponent(query);
        const response = await api.get<FoodItemResponse[]>(
          `/food/search?q=${encodedQuery}&limit=${limit}`
        );

        const foodItems = response.map(parseFoodItem);
        setResults(foodItems);
      } catch (err: any) {
        // Ignore abort errors (user typed more characters)
        if (err.name === 'AbortError') {
          return;
        }

        setError(formatError(err, 'Failed to search food items'));
        setResults([]);
        console.error('Food search error:', err);
      } finally {
        setIsSearching(false);
      }
    },
    [api, limit]
  );

  /**
   * Lookup food item by barcode
   */
  const lookupByBarcode = useCallback(
    async (code: string): Promise<FoodItem | null> => {
      setIsSearching(true);
      setError(null);

      try {
        const trimmedCode = code.trim();
        if (!trimmedCode) {
          throw new Error('Barcode cannot be empty');
        }

        const encodedCode = encodeURIComponent(trimmedCode);
        const response = await api.get<BarcodeFoodItemResponse>(
          `/barcodes/${encodedCode}`
        );

        const foodItem = parseFoodItem(response);

        // Populate results with the found item
        setResults([foodItem]);
        setSearchTerm(foodItem.foodName);

        return foodItem;
      } catch (err: any) {
        // Handle 404 (not found) gracefully
        if (err.statusCode === 404) {
          setError('No food item found for this barcode');
          setResults([]);
          return null;
        }

        setError(formatError(err, 'Failed to lookup barcode'));
        setResults([]);
        console.error('Barcode lookup error:', err);
        return null;
      } finally {
        setIsSearching(false);
      }
    },
    [api]
  );

  /**
   * Clear search state
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setError(null);
    setIsSearching(false);

    // Cancel any pending requests
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const trimmedTerm = searchTerm.trim();

    // Clear results if search term is too short
    if (trimmedTerm.length < minQueryLength) {
      setResults([]);
      setError(null);
      setIsSearching(false);
      return;
    }

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      searchFoodItems(trimmedTerm);
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, minQueryLength, debounceMs, searchFoodItems]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isSearching,
    error,
    lookupByBarcode,
    clearSearch,
  };
};
