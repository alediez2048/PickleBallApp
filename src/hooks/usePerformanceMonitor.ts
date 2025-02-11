import { useRef, useEffect } from 'react';
import { InteractionManager } from 'react-native';

export interface PerformanceMetrics {
  mountTime: number;
  renderTime: number;
  interactionTime: number;
}

interface PerformanceMonitorOptions {
  componentName: string;
  onMetricsCollected?: (metrics: PerformanceMetrics) => void;
}

export function usePerformanceMonitor({ componentName, onMetricsCollected }: PerformanceMonitorOptions) {
  const startTimeRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(0);
  const renderTimeRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();

    const interaction = InteractionManager.createInteractionHandle();

    return () => {
      const endTime = performance.now();
      const metrics: PerformanceMetrics = {
        mountTime: mountTimeRef.current - startTimeRef.current,
        renderTime: renderTimeRef.current - startTimeRef.current,
        interactionTime: endTime - startTimeRef.current,
      };

      console.debug(`[Performance] ${componentName}:`, metrics);
      onMetricsCollected?.(metrics);

      InteractionManager.clearInteractionHandle(interaction);
    };
  }, [componentName, onMetricsCollected]);

  useEffect(() => {
    mountTimeRef.current = performance.now();
  }, []);

  useEffect(() => {
    renderTimeRef.current = performance.now();
  });

  return null;
} 