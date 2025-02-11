import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View, Button } from 'react-native';
import { ErrorBoundary } from '../../ErrorBoundary';

// Mock component that throws an error
function BuggyComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return null;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Normal content</Text>
      </ErrorBoundary>
    );

    expect(getByText('Normal content')).toBeTruthy();
  });

  it('renders error UI when there is an error', () => {
    const { getByText, getByRole } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
    expect(getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('calls onError prop when an error occurs', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('renders custom fallback when provided', () => {
    const fallback = <Text>Custom fallback</Text>;
    const { getByText } = render(
      <ErrorBoundary fallback={fallback}>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(getByText('Custom fallback')).toBeTruthy();
  });

  it('resets error boundary when retry is clicked', () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      
      return (
        <ErrorBoundary>
          <View>
            <BuggyComponent shouldThrow={shouldThrow} />
            <Button 
              title="Toggle Error" 
              onPress={() => setShouldThrow(false)} 
            />
          </View>
        </ErrorBoundary>
      );
    };

    const { getByRole, getByText } = render(<TestComponent />);
    
    // Initially shows error
    expect(getByText('Something went wrong')).toBeTruthy();
    
    // Click retry
    fireEvent.press(getByRole('button', { name: 'Retry' }));
    
    // Toggle error state
    fireEvent.press(getByRole('button', { name: 'Toggle Error' }));
    
    // Should now show normal content
    expect(getByText('Normal content')).toBeTruthy();
  });

  it('provides proper accessibility props', () => {
    const { getByRole } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    const alert = getByRole('alert');
    expect(alert).toBeTruthy();
    expect(alert.props.accessibilityLiveRegion).toBe('assertive');

    const retryButton = getByRole('button', { name: 'Retry' });
    expect(retryButton.props.accessibilityHint).toBe(
      'Attempts to recover from the error by retrying'
    );
  });

  it('shows stack trace in development', () => {
    const originalDev = __DEV__;
    (global as any).__DEV__ = true;

    const { queryByTestId } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(queryByTestId('dev-error-container')).toBeTruthy();

    (global as any).__DEV__ = originalDev;
  });

  it('does not show stack trace in production', () => {
    const originalDev = __DEV__;
    (global as any).__DEV__ = false;

    const { queryByTestId } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(queryByTestId('dev-error-container')).toBeNull();

    (global as any).__DEV__ = originalDev;
  });
}); 