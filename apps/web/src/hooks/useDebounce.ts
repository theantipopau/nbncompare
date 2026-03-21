import { useEffect, useState } from 'react';

/**
 * Custom hook for debouncing values (e.g., search input)
 * Useful for reducing API calls during typing
 * 
 * Usage:
 *   const debouncedSearch = useDebounce(searchTerm, 300);
 *   useEffect(() => {
 *     if (debouncedSearch) fetchResults(debouncedSearch);
 *   }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes (also on component unmount)
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for debouncing a callback function
 * Useful for debouncing API calls or event handlers
 * 
 * Usage:
 *   const debouncedFetch = useDebouncedCallback(
 *     (term) => fetchAddresses(term),
 *     300
 *   );
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = (...args: Args) => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return debouncedCallback;
}

export default useDebounce;
