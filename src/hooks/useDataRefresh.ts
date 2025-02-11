import { useEffect, useRef, useState } from 'react';
import { useNetInfo } from '@react-native-community/netinfo';

interface RefreshConfig {
  retryAttempts?: number;
  retryDelay?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const DEFAULT_CONFIG: Required<RefreshConfig> = {
  retryAttempts: 3,
  retryDelay: 1000,
  onSuccess: () => {},
  onError: () => {},
};

export function useDataRefresh<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: RefreshConfig = {}
) {
  const { isConnected } = useNetInfo();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const retryCount = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  const refresh = async () => {
    if (!isConnected) {
      setError(new Error('No internet connection'));
      return;
    }

    setIsRefreshing(true);
    setError(null);

    try {
      await fetcher();
      retryCount.current = 0;
      fullConfig.onSuccess();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);

      if (retryCount.current < fullConfig.retryAttempts) {
        timeoutRef.current = setTimeout(() => {
          retryCount.current += 1;
          refresh();
        }, fullConfig.retryDelay * Math.pow(2, retryCount.current)); // Exponential backoff
      } else {
        fullConfig.onError(error);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const handleRefresh = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string }>;
      if (customEvent.detail.key === key) {
        refresh();
      }
    };

    window.addEventListener('cacheRefresh', handleRefresh);

    return () => {
      window.removeEventListener('cacheRefresh', handleRefresh);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key]);

  return {
    isRefreshing,
    error,
    refresh,
  };
} 