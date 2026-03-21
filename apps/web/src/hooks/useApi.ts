import { useState, useCallback } from 'react';

interface UseApiOptions {
  maxRetries?: number;
  retryDelay?: number; // ms
  onRetry?: (attempt: number) => void;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retrying: boolean;
}

/**
 * Custom hook for API calls with automatic retry and error handling
 * Provides: data, loading, error, retry function
 */
export function useApi<T>(
  apiFn: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const { maxRetries = 3, retryDelay = 1000, onRetry } = options;
  
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
    retrying: false,
  });
  
  const [attemptCount, setAttemptCount] = useState(0);

  const executeApi = useCallback(async (isRetry = false) => {
    if (isRetry) {
      setState(prev => ({ ...prev, retrying: true }));
    } else {
      setState(prev => ({ ...prev, loading: true, error: null }));
      setAttemptCount(0);
    }

    try {
      const data = await apiFn();
      setState({
        data,
        loading: false,
        error: null,
        retrying: false,
      });
      setAttemptCount(0);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      if (newAttemptCount < maxRetries) {
        // Retry automatically
        onRetry?.(newAttemptCount);
        setTimeout(() => executeApi(true), retryDelay * newAttemptCount); // exponential backoff
      } else {
        // Max retries reached
        setState({
          data: null,
          loading: false,
          error,
          retrying: false,
        });
      }
    }
  }, [apiFn, maxRetries, retryDelay, attemptCount, onRetry]);

  // Retry function (manual retry after max retries reached)
  const retry = useCallback(() => {
    setAttemptCount(0);
    executeApi(false);
  }, [executeApi]);

  return {
    ...state,
    retry,
    retryCount: attemptCount,
    maxRetries,
  };
}

export default useApi;
