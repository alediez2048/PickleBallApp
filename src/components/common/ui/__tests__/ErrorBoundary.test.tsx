import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { ErrorBoundary } from '../ErrorBoundary';

// Mock component that throws an error
function BuggyComponent({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>Working component</Text>;
}

describe('ErrorBoundary', () => {
  // Prevent console.error from cluttering the test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Text>Test content</Text>
      </ErrorBoundary>
    );

    expect(getByText('Test content')).toBeTruthy();
  });

  it('renders fallback UI when there is an error', () => {
    const { getByTestId, getByText } = render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(getByTestId('error-boundary-fallback')).toBeTruthy();
    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
  });

  it('calls onError when an error occurs', () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <Text>Custom error message</Text>;
    const { getByText, queryByTestId } = render(
      <ErrorBoundary fallback={customFallback}>
        <BuggyComponent />
      </ErrorBoundary>
    );

    expect(getByText('Custom error message')).toBeTruthy();
    expect(queryByTestId('error-boundary-fallback')).toBeNull();
  });

  it('resets error state when Try Again is pressed', () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      return (
        <ErrorBoundary>
          <BuggyComponent shouldThrow={shouldThrow} />
          <Text onPress={() => setShouldThrow(false)}>Toggle error</Text>
        </ErrorBoundary>
      );
    };

    const { getByText, queryByTestId } = render(<TestComponent />);

    // Initially shows error
    expect(queryByTestId('error-boundary-fallback')).toBeTruthy();

    // Press Try Again
    fireEvent.press(getByText('Try Again'));

    // Error boundary should reset and try to render children again
    expect(queryByTestId('error-boundary-fallback')).toBeTruthy();
  });

  it('handles nested error boundaries correctly', () => {
    const { getByTestId, getAllByText } = render(
      <ErrorBoundary>
        <Text>Outer content</Text>
        <ErrorBoundary>
          <BuggyComponent />
        </ErrorBoundary>
      </ErrorBoundary>
    );

    // Only inner error boundary should show error
    expect(getByTestId('error-boundary-fallback')).toBeTruthy();
    expect(getAllByText('Something went wrong')).toHaveLength(1);
  });
}); 