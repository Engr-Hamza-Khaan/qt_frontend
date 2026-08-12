import { useState, useEffect, useCallback } from 'react';

export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(fetchFn));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!fetchFn) {
      setLoading(false);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
      return result;
    } catch (err) {
      const errMsg = err?.message || 'Something went wrong';
      setError(errMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch, setData };
}
