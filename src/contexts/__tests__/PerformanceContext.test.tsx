import React from 'react';
import { act } from 'react-test-renderer';
import { PerformanceProvider, usePerformance } from '../PerformanceContext';
import type { PerformanceMetrics } from '@/hooks/usePerformanceMonitor';

// Helper to test hooks
function testHook<T>(callback: () => T, Wrapper?: React.ComponentType<{children: React.ReactNode}>): { result: { current: T } } {
  const container = {
    result: { current: undefined as unknown as T }
  };

  function TestComponent() {
    // @ts-ignore
    container.result.current = callback();
    return null;
  }

  if (Wrapper) {
    // Execute the component with the provided wrapper
    const WrappedComponent = () => {
      const WrapperComponent = Wrapper;
      return (
        <WrapperComponent>
          <TestComponent />
        </WrapperComponent>
      );
    };
    WrappedComponent();
  } else {
    // Execute the component without a wrapper
    TestComponent();
  }
  
  return {
    result: container.result
  };
}

describe('PerformanceContext', () => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <PerformanceProvider>{children}</PerformanceProvider>
  );

  const mockMetrics: PerformanceMetrics = {
    mountTime: 100,
    renderTime: 200,
    interactionTime: 300,
  };

  it('throws error when used outside provider', () => {
    expect(() => {
      testHook(() => usePerformance());
    }).toThrow('usePerformance must be used within a PerformanceProvider');
  });

  it('adds metrics for a component', () => {
    const { result } = testHook(() => usePerformance(), TestWrapper);

    act(() => {
      result.current.addMetrics('TestComponent', mockMetrics);
    });

    expect(result.current.metrics['TestComponent']).toEqual([mockMetrics]);
  });

  it('accumulates multiple metrics for the same component', () => {
    const { result } = testHook(() => usePerformance(), TestWrapper);

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
    const { result } = testHook(() => usePerformance(), TestWrapper);

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
    const { result } = testHook(() => usePerformance(), TestWrapper);
    expect(result.current.getAverageMetrics('NonExistentComponent')).toBeNull();
  });

  it('clears metrics for a specific component', () => {
    const { result } = testHook(() => usePerformance(), TestWrapper);

    act(() => {
      result.current.addMetrics('Component1', mockMetrics);
      result.current.addMetrics('Component2', mockMetrics);
      result.current.clearMetrics('Component1');
    });

    expect(result.current.metrics['Component1']).toBeUndefined();
    expect(result.current.metrics['Component2']).toBeDefined();
  });

  it('clears all metrics', () => {
    const { result } = testHook(() => usePerformance(), TestWrapper);

    act(() => {
      result.current.addMetrics('Component1', mockMetrics);
      result.current.addMetrics('Component2', mockMetrics);
      result.current.clearMetrics();
    });

    expect(result.current.metrics).toEqual({});
  });
}); 