import { useState, useEffect } from "react";

/**
 * Custom hook to debounce a fast-changing value.
 * @param value The value to debounce.
 * @param delay The delay in milliseconds (default: 300ms).
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
