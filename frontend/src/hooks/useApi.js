import { useState, useCallback } from 'react';

/**
 * Generic hook for async API calls with loading/error state.
 *
 * Usage:
 *   const { execute, loading, error } = useApi(transactionsAPI.create);
 *   await execute({ amount: 100, type: 'income', ... });
 */
export function useApi(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [data,    setData]    = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { execute, loading, error, data };
}

/**
 * useLocalApi – same shape but runs synchronously against a local state setter.
 * Used in demo/mock mode.
 */
export function useLocalApi() {
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (fn, delay = 400) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, delay));
    const result = fn();
    setLoading(false);
    return result;
  }, []);

  return { run, loading };
}
