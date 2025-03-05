# React Native Testing Documentation

## Overview

This document outlines the testing strategy we've adopted for the PickleBall App. After facing several challenges with React Native testing, we've developed a solid approach for component testing that avoids common pitfalls.

## Testing Challenges

We faced several common challenges in testing React Native components:

1. **Unmounted Test Renderer Error**: Using React Native Testing Library's render function would result in "Can't access .root on unmounted test renderer" errors.
2. **Mock Implementation Issues**: Jest's module factory limitations made it difficult to use variables outside the mock scope.
3. **CSS Interop Mocking**: Components using `react-native-css-interop` faced issues with `getColorScheme` method and other appearance-related functionality.
4. **Lifecycle Management**: Proper cleanup of test renderers between tests was challenging.

## Our Testing Solution

### 1. Snapshot Testing Approach

We've adopted a snapshot testing approach using `react-test-renderer` directly rather than React Native Testing Library's render function:

```javascript
import renderer from 'react-test-renderer';

// Create the renderer and take a snapshot
const tree = renderer.create(<YourComponent {...props} />).toJSON();
expect(tree).toMatchSnapshot();
```

This approach avoids the "unmounted test renderer" error and provides reliable visual component testing.

### 2. Mock Setup

Our mock setup follows these patterns:

#### Simple Component Mocks

```javascript
// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    navigate: jest.fn(),
  }),
}));
```

#### CSS Interop Mocking

In `jest.setup.js`, we have comprehensive mocks for the CSS interop modules:

```javascript
jest.mock('react-native-css-interop/src/runtime/native/appearance-observables', () => ({
  getColorScheme: jest.fn().mockReturnValue('light'),
  addAppearanceListener: jest.fn().mockReturnValue({
    remove: jest.fn(),
  }),
  addEventListener: jest.fn().mockReturnValue({
    remove: jest.fn(),
  }),
  resetAppearanceListeners: jest.fn(),
}));
```

### 3. Helper Utilities

For more complex rendering needs, we've created utilities in `src/utils/testing/renderWithoutUnmounting.ts`:

```javascript
export function render(component) {
  const renderedComponent = renderer.create(component);
  renderedComponents.push(renderedComponent);
  return renderedComponent;
}

export function cleanupRenderedComponents() {
  // Clean up all previously rendered components
  while (renderedComponents.length > 0) {
    const component = renderedComponents.pop();
    if (component && typeof component.unmount === 'function') {
      component.unmount();
    }
  }
}
```

## Test Examples

### Simple Snapshot Test

```javascript
it('renders correctly with default props', () => {
  const tree = renderer.create(<PaymentMethodForm />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

### Component with Props

```javascript
it('renders correctly in first-time mode', () => {
  const tree = renderer.create(<PaymentMethodForm isFirstTime />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

### Components with Complex State

For components that rely on hooks or complex state, we mock the hooks:

```javascript
// Mock hook
jest.mock('../../hooks/useGameRegistration', () => {
  return jest.fn().mockReturnValue({
    spotsAvailable: 3,
    totalSpots: 8,
    isLoading: false,
    isFull: false,
    error: null,
    bookGame: jest.fn(),
    cancelBooking: jest.fn(),
  });
});
```

## Best Practices

1. **Keep Tests Simple**: Focus on snapshot testing for component rendering verification.
2. **Mock External Dependencies**: Always mock external modules, APIs, and context providers.
3. **Avoid Complex Assertions**: Stick to simple, reliable assertions instead of complex DOM queries or interactions.
4. **Test in Isolation**: Test components in isolation to avoid cascading failures.
5. **Update Snapshots Intentionally**: When components change legitimately, use `jest -u` to update snapshots.

## Tools and Configuration

- **Jest**: Our main testing framework
- **react-test-renderer**: For rendering components in tests
- **Jest Setup File**: Contains global mock configurations (`jest.setup.js`)

## Coverage

While we aim for high coverage, currently we're focusing on ensuring all components have at least basic rendering tests. Our long-term coverage goals are:

- 70% Statement coverage
- 70% Branch coverage 
- 70% Function coverage
- 70% Line coverage

## Future Improvements

1. Add more interaction tests using `act` and events
2. Increase overall test coverage
3. Add integration tests for key user flows
4. Consider implementing E2E testing with Detox 