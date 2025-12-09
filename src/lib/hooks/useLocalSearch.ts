import { useState, useMemo } from 'react';

interface UseLocalSearchResult<T> {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  results: T[];
  isSearching: boolean;
  error: string | null;
  clearSearch: () => void;
}

export function useLocalSearch<T>(
  items: T[],
  searchKey: keyof T
): UseLocalSearchResult<T> {
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }

    return items.filter((item) => {
      const value = item[searchKey];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [items, searchTerm, searchKey]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    results,
    isSearching: false,
    error: null,
    clearSearch,
  };
}
