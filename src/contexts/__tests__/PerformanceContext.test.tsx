import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { PerformanceProvider, usePerformance } from '../PerformanceContext';
import type { PerformanceMetrics } from '@/hooks/usePerformanceMonitor';

describe('PerformanceContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <PerformanceProvider>{children}</PerformanceProvider>
  );

  const mockMetrics: PerformanceMetrics = {
    mountTime: 100,
    renderTime: 200,
    interactionTime: 300,
  };

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => usePerformance());
    }).toThrow('usePerformance must be used within a PerformanceProvider');
  });

  it('adds metrics for a component', () => {
    const { result } = renderHook(() => usePerformance(), { wrapper });

    act(() => {
      result.current.addMetrics('TestComponent', mockMetrics);
    });

    expect(result.current.metrics['TestComponent']).toEqual([mockMetrics]);
  });

  it('accumulates multiple metrics for the same component', () => {
    const { result } = renderHook(() => usePerformance(), { wrapper });

    act(() => {
      result.current.addMetrics('TestComponent', mockMetrics);
      result.current.addMetrics('TestComponent', {
        mountTime: 150,
        renderTime: 250,
        interactionTime: 350,
      });
    });

    expect(result.current.metrics['TestComponent']).toHaveLength(2);
  });

  it('calculates average metrics correctly', () => {
    const { result } = renderHook(() => usePerformance(), { wrapper });

    act(() => {
      result.current.addMetrics('TestComponent', mockMetrics);
      result.current.addMetrics('TestComponent', {
        mountTime: 300,
        renderTime: 400,
        interactionTime: 500,
      });
    });

    const averageMetrics = result.current.getAverageMetrics('TestComponent');
    expect(averageMetrics).toEqual({
      mountTime: 200, // (100 + 300) / 2
      renderTime: 300, // (200 + 400) / 2
      interactionTime: 400, // (300 + 500) / 2
    });
  });

  it('returns null for average metrics of non-existent component', () => {
    const { result } = renderHook(() => usePerformance(), { wrapper });
    expect(result.current.getAverageMetrics('NonExistentComponent')).toBeNull();
  });

  it('clears metrics for a specific component', () => {
    const { result } = renderHook(() => usePerformance(), { wrapper });

    act(() => {
      result.current.addMetrics('Component1', mockMetrics);
      result.current.addMetrics('Component2', mockMetrics);
      result.current.clearMetrics('Component1');
    });

    expect(result.current.metrics['Component1']).toBeUndefined();
    expect(result.current.metrics['Component2']).toBeDefined();
  });

  it('clears all metrics', () => {
    const { result } = renderHook(() => usePerformance(), { wrapper });

    act(() => {
      result.current.addMetrics('Component1', mockMetrics);
      result.current.addMetrics('Component2', mockMetrics);
      result.current.clearMetrics();
    });

    expect(result.current.metrics).toEqual({});
  });
}); 