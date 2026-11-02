import { useState, useEffect, useCallback } from "react";
import { useAxios } from "@/lib/useAxios";

export interface UseFetchOptions {
  autoFetch?: boolean;
}

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<T | null>;
}

/**
 * Generic data fetching hook using the centralized axios instance.
 * @param url API endpoint relative to base or absolute URL.
 * @param options Configuration options.
 */
export function useFetch<T = any>(
  url: string | null,
  options: UseFetchOptions = { autoFetch: true }
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(url && options.autoFetch !== false));
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (): Promise<T | null> => {
    if (!url) return null;
    const cleanUrl = url.trim();
    if (!cleanUrl) return null;

    setLoading(true);
    setError(null);
    try {
      const axios = await useAxios();
      const response = await axios.get(cleanUrl);
      const resData = response.data?.data !== undefined ? response.data.data : response.data;
      setData(resData);
      return resData;
    } catch (err: any) {
      const formattedError = new Error(err.response?.data?.message || err.message || "Failed to fetch data");
      setError(formattedError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (options.autoFetch !== false && url) {
      fetchData();
    }
  }, [url, options.autoFetch, fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch;
