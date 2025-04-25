import { useState, useEffect } from "react";

interface CacheItem {
  data: any;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cache: Record<string, CacheItem> = {};

export function useCachedApi<T>(
  key: string,
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Check cache first
        const cached = cache[key];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setData(cached.data);
          setLoading(false);
          return;
        }

        // Fetch new data
        const newData = await fetchFn();

        // Update cache
        cache[key] = {
          data: newData,
          timestamp: Date.now(),
        };

        setData(newData);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, ...dependencies]);

  return { data, loading, error };
}
