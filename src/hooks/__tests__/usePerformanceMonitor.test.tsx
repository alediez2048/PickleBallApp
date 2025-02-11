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
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(performance, 'now').mockImplementation(() => 1000);
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
    const nowMock = jest.spyOn(performance, 'now');

    // Mock different timestamps for different measurements
    nowMock
      .mockReturnValueOnce(1000) // start time
      .mockReturnValueOnce(1100) // mount time
      .mockReturnValueOnce(1200) // render time
      .mockReturnValueOnce(1500); // end time

    const { unmount } = renderHook(() =>
      usePerformanceMonitor({
        componentName: 'TestComponent',
        onMetricsCollected,
      })
    );

    unmount();

    expect(onMetricsCollected).toHaveBeenCalledWith({
      mountTime: 100, // 1100 - 1000
      renderTime: 200, // 1200 - 1000
      interactionTime: 500, // 1500 - 1000
    });
  });

  it('logs performance metrics to console in debug mode', () => {
    const consoleSpy = jest.spyOn(console, 'debug');
    const nowMock = jest.spyOn(performance, 'now');

    nowMock
      .mockReturnValueOnce(1000)
      .mockReturnValueOnce(1100)
      .mockReturnValueOnce(1200)
      .mockReturnValueOnce(1500);

    const { unmount } = renderHook(() =>
      usePerformanceMonitor({ componentName: 'TestComponent' })
    );

    unmount();

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Performance] TestComponent:',
      expect.objectContaining({
        mountTime: expect.any(Number),
        renderTime: expect.any(Number),
        interactionTime: expect.any(Number),
      })
    );
  });
}); 