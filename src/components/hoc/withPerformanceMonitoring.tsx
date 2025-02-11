import React from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { usePerformance } from '@/contexts/PerformanceContext';

export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: { componentName?: string } = {}
) {
  const displayName = options.componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function WithPerformanceMonitoring(props: P) {
    const { addMetrics } = usePerformance();

    usePerformanceMonitor({
      componentName: displayName,
      onMetricsCollected: (metrics) => {
        addMetrics(displayName, metrics);
      },
    });

    return <WrappedComponent {...props} />;
  }

  WithPerformanceMonitoring.displayName = `withPerformanceMonitoring(${displayName})`;

  return WithPerformanceMonitoring;
} 