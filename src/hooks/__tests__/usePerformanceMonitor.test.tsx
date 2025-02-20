import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { usePerformanceMonitor } from '../usePerformanceMonitor';
import { InteractionManager } from 'react-native';

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
    const { unmount } = renderHook(() =>
      usePerformanceMonitor({ componentName: 'TestComponent' })
    );

    expect(InteractionManager.createInteractionHandle).toHaveBeenCalled();
    
    unmount();
    
    expect(InteractionManager.clearInteractionHandle).toHaveBeenCalled();
  });

  it('collects performance metrics', () => {
    const onMetricsCollected = jest.fn();

    // Set up the sequence of timestamps
    const timestamps = [1000, 1100, 1200, 1500];
    let timestampIndex = 0;
    nowMock.mockImplementation(() => timestamps[timestampIndex++]);

    const { unmount } = renderHook(() =>
      usePerformanceMonitor({
        componentName: 'TestComponent',
        onMetricsCollected,
      })
    );

    // Ensure all timestamps have been used
    expect(timestampIndex).toBe(3); // We expect 3 calls during mount

    // Trigger unmount which will use the last timestamp
    unmount();

    // Verify all timestamps were used
    expect(timestampIndex).toBe(4);

    expect(onMetricsCollected).toHaveBeenCalledWith({
      mountTime: 100, // 1100 - 1000
      renderTime: 200, // 1200 - 1000
      interactionTime: 500, // 1500 - 1000
    });
  });

  it('logs performance metrics to console in debug mode', () => {
    const consoleSpy = jest.spyOn(console, 'debug');

    // Set up the sequence of timestamps
    const timestamps = [1000, 1100, 1200, 1500];
    let timestampIndex = 0;
    nowMock.mockImplementation(() => timestamps[timestampIndex++]);

    const { unmount } = renderHook(() =>
      usePerformanceMonitor({ componentName: 'TestComponent' })
    );

    unmount();

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Performance] TestComponent:',
      expect.objectContaining({
        mountTime: 100,
        renderTime: 200,
        interactionTime: 500,
      })
    );
  });
}); 