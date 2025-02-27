# Testing Guide for PickleBallApp

This document outlines the testing approach and best practices for the PickleBallApp project.

## Table of Contents

1. [Testing Infrastructure](#testing-infrastructure)
2. [Custom Transformers](#custom-transformers)
3. [Test File Structure](#test-file-structure)
4. [Component Testing Examples](#component-testing-examples)
5. [Mocking Strategies](#mocking-strategies)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Coverage Goals](#coverage-goals)

## Testing Infrastructure

The project uses Jest with React Native Testing Library for component testing. The setup includes:

- **Jest Configuration**: Found in `jest.config.js` in the project root
- **Jest Setup File**: Found in `jest.setup.js` in the project root
- **Custom Transformers**: Found in `jest/transformers/` directory
- **Test Utilities**: Found in `src/utils/test-utils.tsx`

## Custom Transformers

### CSS Interop Transformer

We use a custom transformer for handling React Native CSS Interop modules to avoid issues with dependencies during testing. 

The transformer is located at `jest/transformers/cssInteropTransformer.js` and replaces any CSS interop imports with standardized mocks.

#### How it works:

1. The transformer intercepts any imports from `react-native-css-interop` or `@expo/stylesheets`
2. It replaces the import with a mock implementation that provides all necessary functions and objects
3. The Jest configuration is set up to use this transformer for specific module patterns

#### Benefits:

- No need to manually mock CSS interop modules in each test
- Consistent behavior across all tests
- Easier to maintain and update when the CSS interop library changes
- Eliminates difficult-to-diagnose errors related to CSS interop functionality

## Test File Structure

Test files should follow this structure:

```
src/
  components/
    MyComponent/
      MyComponent.tsx
      __tests__/
        MyComponent.test.tsx
  hooks/
    useMyHook/
      useMyHook.ts
      __tests__/
        useMyHook.test.ts
```

## Component Testing Examples

### Basic Component Test Example (PaymentMethodForm)

```tsx
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { PaymentMethodForm } from '../PaymentMethodForm';
import { render } from '@/utils/test-utils';

describe('PaymentMethodForm', () => {
  // Mock dependencies directly that are used by the component
  jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
      user: {...},
      updatePaymentMethods: jest.fn(),
    }),
  }));

  it('renders correctly', async () => {
    const { getByPlaceholderText } = render(<PaymentMethodForm />);
    
    await waitFor(() => {
      expect(getByPlaceholderText('1234 5678 9012 3456')).toBeTruthy();
    });
  });
  
  // Additional tests...
});
```

## Mocking Strategies

### Direct Context Mocking

When testing components that use contexts, prefer direct mocking of the hook functions over wrapping with providers:

```typescript
// GOOD - Mock the hook directly
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {...},
    signIn: jest.fn(),
  }),
}));

// AVOID - Complex provider setups
const wrapper = ({ children }) => (
  <AuthProvider>
    <UIProvider>
      {children}
    </UIProvider>
  </AuthProvider>
);
```

### Component Mocking

For UI components that are used frequently, create standard mocks in `jest.setup.js`:

```javascript
jest.mock('@/components/ThemedText', () => ({
  ThemedText: ({ children, ...props }) => ({
    type: 'ThemedText',
    props: { children, ...props },
    $$typeof: Symbol.for('react.element'),
  }),
}));
```

## Common Issues & Solutions

### CSS Interop Issues

- **Problem**: Tests fail with errors related to `getColorScheme` or other CSS interop functions
- **Solution**: Ensure the CSS Interop transformer is properly configured in `jest.config.js`

### Context Value Access

- **Problem**: Components can't access context values in tests
- **Solution**: Mock the context hook directly rather than trying to provide context values

### Async Rendering

- **Problem**: Tests fail because components are still rendering
- **Solution**: Use `waitFor` from React Native Testing Library to wait for components to finish rendering

## Coverage Goals

The project aims for 70% coverage across:
- Branches
- Functions
- Lines
- Statements

Priority areas for testing:
1. Core user flows (authentication, game booking, payment)
2. Shared components used across multiple screens
3. Business logic in hooks and services

## Running Tests

```bash
# Run all tests
npm test

# Run a specific test file
npm test -- src/components/payment/__tests__/PaymentMethodForm.test.tsx

# Run tests with coverage report
npm test -- --coverage
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on the state of other tests.
2. **Meaningful Assertions**: Test behavior, not implementation details.
3. **Clear Naming**: Use descriptive test names that explain the expected behavior.
4. **Setup and Teardown**: Use beforeEach/afterEach for common setup and cleanup.
5. **Mock External Dependencies**: Use jest.mock() for external services and APIs.

## Error Handling Testing

Test both success and error scenarios:
- Network errors
- Validation errors
- Authentication errors
- Permission errors
- Edge cases

## Cross-Device Testing

Test the application across different:
- Screen sizes
- OS versions (iOS/Android)
- Device capabilities
- Network conditions

## CI/CD Integration

Tests are run automatically on:
- Pull requests
- Merges to main branches
- Release builds

## Debugging Tests

1. Use `console.log()` or `debug()` to inspect component output
2. Use Jest's `--verbose` flag for detailed output
3. Use snapshot testing for complex component structures
4. Use Jest's debugging capabilities with VS Code

## Maintenance

1. Regular review and updates of test cases
2. Removal of obsolete tests
3. Update mocks and fixtures as needed
4. Monitor and improve test performance

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/) 
 
 
 