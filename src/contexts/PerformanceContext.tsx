import React, { createContext, useContext, useCallback, useState } from 'react';
import type { PerformanceMetrics } from '@/hooks/usePerformanceMonitor';

interface PerformanceContextType {
  metrics: Record<string, PerformanceMetrics[]>;
  addMetrics: (componentName: string, metrics: PerformanceMetrics) => void;
  getAverageMetrics: (componentName: string) => PerformanceMetrics | null;
  clearMetrics: (componentName?: string) => void;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const [metrics, setMetrics] = useState<Record<string, PerformanceMetrics[]>>({});

  const addMetrics = useCallback((componentName: string, newMetrics: PerformanceMetrics) => {
    setMetrics(prev => ({
      ...prev,
      [componentName]: [...(prev[componentName] || []), newMetrics],
    }));
  }, []);

  const getAverageMetrics = useCallback((componentName: string): PerformanceMetrics | null => {
    const componentMetrics = metrics[componentName];
    if (!componentMetrics?.length) return null;

    return {
      mountTime: componentMetrics.reduce((acc, m) => acc + m.mountTime, 0) / componentMetrics.length,
      renderTime: componentMetrics.reduce((acc, m) => acc + m.renderTime, 0) / componentMetrics.length,
      interactionTime: componentMetrics.reduce((acc, m) => acc + m.interactionTime, 0) / componentMetrics.length,
    };
  }, [metrics]);

  const clearMetrics = useCallback((componentName?: string) => {
    if (componentName) {
      setMetrics(prev => {
        const { [componentName]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setMetrics({});
    }
  }, []);

  return (
    <PerformanceContext.Provider
      value={{
        metrics,
        addMetrics,
        getAverageMetrics,
        clearMetrics,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
} 