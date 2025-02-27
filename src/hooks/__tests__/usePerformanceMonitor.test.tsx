import React from 'react';
import { act } from 'react-test-renderer';
import { usePerformanceMonitor } from '../usePerformanceMonitor';
import { InteractionManager } from 'react-native';

// Create a helper function for testing hooks
function testHook<T>(callback: () => T, unmountCallback?: () => void): { result: { current: T }, unmount: () => void } {
  const container = {
    result: { current: undefined as unknown as T }
  };

  function TestComponent() {
    // @ts-ignore
    container.result.current = callback();
    return null;
  }

  // @ts-ignore Doesn't actually need to render, just needs to run the hook
  const render = () => TestComponent();
  
  render();
  
  return {
    result: container.result,
    unmount: () => {
      if (unmountCallback) {
        unmountCallback();
      }
    }
  };
}

jest.mock('react-native', () => ({
  InteractionManager: {
    createInteractionHandle: jest.fn(),
    clearInteractionHandle: jest.fn(),
  },
}));

describe('usePerformanceMonitor', () => {
  let nowMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    
    // Create a new mock for performance.now() in each test
    nowMock = jest.spyOn(performance, 'now');
    nowMock.mockReturnValue(1000); // Default value
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates and cleans up interaction handle', () => {
    const cleanup = jest.fn();
    
    const { unmount } = testHook(
      () => usePerformanceMonitor({ componentName: 'TestComponent' }),
      cleanup
    );

    expect(InteractionManager.createInteractionHandle).toHaveBeenCalled();
    
    // Trigger effect cleanups with act to simulate unmounting
    act(() => {
      unmount();
    });
    
    expect(InteractionManager.clearInteractionHandle).toHaveBeenCalled();
  });

  it('collects performance metrics', () => {
    const onMetricsCollected = jest.fn();

    // Set up the sequence of timestamps
    const timestamps = [1000, 1100, 1200, 1500];
    let timestampIndex = 0;
    nowMock.mockImplementation(() => timestamps[timestampIndex++]);

    // We need a way to call the cleanup function explicitly in our test
    let effectCleanupFn: (() => void) | undefined;
    const originalUseEffect = React.useEffect;
    jest.spyOn(React, 'useEffect').mockImplementation((effect, deps) => {
      if (deps === undefined || deps.length === 0) {
        return originalUseEffect(effect, deps);
      }
      // Capture the cleanup function from the main effect
      const cleanup = effect();
      if (typeof cleanup === 'function' && !effectCleanupFn) {
        effectCleanupFn = cleanup;
      }
      return originalUseEffect(effect, deps);
    });

    testHook(() =>
      usePerformanceMonitor({
        componentName: 'TestComponent',
        onMetricsCollected,
      })
    );

    // Ensure all timestamps have been used
    expect(timestampIndex).toBe(3); // We expect 3 calls during mount

    // Manually trigger the cleanup function captured from useEffect
    // Ensure the cleanup function exists before calling it
    expect(effectCleanupFn).toBeDefined();
    act(() => {
      if (effectCleanupFn) {
        effectCleanupFn();
      }
    });

    // Verify all timestamps were used
    expect(timestampIndex).toBe(4);

    expect(onMetricsCollected).toHaveBeenCalledWith({
      mountTime: 100, // 1100 - 1000
      renderTime: 200, // 1200 - 1000
      interactionTime: 500, // 1500 - 1000
    });
    
    // Restore the original useEffect
    jest.restoreAllMocks();
  });

  it('logs performance metrics to console in debug mode', () => {
    const consoleSpy = jest.spyOn(console, 'debug');

    // Set up the sequence of timestamps
    const timestamps = [1000, 1100, 1200, 1500];
    let timestampIndex = 0;
    nowMock.mockImplementation(() => timestamps[timestampIndex++]);

    // We need a way to call the cleanup function explicitly in our test
    let effectCleanupFn: (() => void) | undefined;
    const originalUseEffect = React.useEffect;
    jest.spyOn(React, 'useEffect').mockImplementation((effect, deps) => {
      if (deps === undefined || deps.length === 0) {
        return originalUseEffect(effect, deps);
      }
      // Capture the cleanup function from the main effect
      const cleanup = effect();
      if (typeof cleanup === 'function' && !effectCleanupFn) {
        effectCleanupFn = cleanup;
      }
      return originalUseEffect(effect, deps);
    });

    testHook(() =>
      usePerformanceMonitor({ componentName: 'TestComponent' })
    );

    // Ensure the cleanup function exists before calling it
    expect(effectCleanupFn).toBeDefined();
    act(() => {
      if (effectCleanupFn) {
        effectCleanupFn();
      }
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Performance] TestComponent:',
      expect.objectContaining({
        mountTime: 100,
        renderTime: 200,
        interactionTime: 500,
      })
    );
    
    // Restore the original useEffect
    jest.restoreAllMocks();
  });
}); 