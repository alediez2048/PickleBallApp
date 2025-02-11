import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { withPerformanceMonitoring } from '../withPerformanceMonitoring';
import { PerformanceProvider } from '@/contexts/PerformanceContext';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

// Mock the usePerformanceMonitor hook
jest.mock('@/hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: jest.fn(),
}));

describe('withPerformanceMonitoring', () => {
  const TestComponent = ({ text }: { text: string }) => <Text>{text}</Text>;
  TestComponent.displayName = 'TestComponent';

  const WrappedComponent = withPerformanceMonitoring(TestComponent);

  beforeEach(() => {
    (usePerformanceMonitor as jest.Mock).mockClear();
  });

  it('renders the wrapped component with its props', () => {
    const { getByText } = render(
      <PerformanceProvider>
        <WrappedComponent text="Hello" />
      </PerformanceProvider>
    );

    expect(getByText('Hello')).toBeTruthy();
  });

  it('sets correct display name', () => {
    expect(WrappedComponent.displayName).toBe('withPerformanceMonitoring(TestComponent)');
  });

  it('uses custom component name when provided', () => {
    const CustomNameComponent = withPerformanceMonitoring(TestComponent, {
      componentName: 'CustomName',
    });

    expect(CustomNameComponent.displayName).toBe('withPerformanceMonitoring(CustomName)');
  });

  it('initializes performance monitoring with correct parameters', () => {
    render(
      <PerformanceProvider>
        <WrappedComponent text="Hello" />
      </PerformanceProvider>
    );

    expect(usePerformanceMonitor).toHaveBeenCalledWith({
      componentName: 'TestComponent',
      onMetricsCollected: expect.any(Function),
    });
  });

  it('handles components without display name', () => {
    const AnonymousComponent = () => <Text>Anonymous</Text>;
    const WrappedAnonymous = withPerformanceMonitoring(AnonymousComponent);

    expect(WrappedAnonymous.displayName).toMatch(/withPerformanceMonitoring\(.+\)/);
  });
}); 