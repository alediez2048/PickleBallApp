# Comprehensive Testing Setup for React Native Applications

This guide outlines how to establish a robust testing infrastructure for React Native applications, with particular focus on handling complex libraries like CSS-in-JS solutions.

## Table of Contents

1. [Understanding the Testing Infrastructure](#understanding-the-testing-infrastructure)
2. [Custom Transformers](#custom-transformers)
3. [Mock Strategies](#mock-strategies)
4. [Jest Configuration](#jest-configuration)
5. [Writing Effective Tests](#writing-effective-tests)
6. [Troubleshooting Common Issues](#troubleshooting-common-issues)

## Understanding the Testing Infrastructure

Testing a React Native application requires a coordinated setup of several components:

- **Jest**: The test runner that executes your tests
- **React Native Testing Library**: Provides utilities to interact with React Native components
- **Mocks**: Replace external dependencies to isolate the code being tested
- **Transformers**: Convert code from one format to another during the test process
- **Configuration**: Tells Jest how to find, run, and process tests

## Custom Transformers

### What are Transformers?

Transformers are functions that process files before Jest runs them. They can:
- Convert TypeScript to JavaScript
- Convert JSX to JavaScript
- Replace imports with mocks
- Transform module formats

### Creating a CSS Interop Transformer

We created a custom transformer to handle React Native CSS Interop modules. This approach solves common issues with CSS-in-JS libraries in tests.

#### Implementation:

```javascript
// jest/transformers/cssInteropTransformer.js

// Helper to determine if a file is a CSS interop file
const isCssInteropFile = (filename) => {
  return filename.includes('react-native-css-interop') ||
         filename.includes('@expo/stylesheets');
};

// Standard mock implementation
const createMockImplementation = () => {
  return `
    module.exports = {
      // Core API functions
      css: function() { return function() { return {}; }; },
      withStyleSheet: function(styles) { return function(component) { return component; }; },
      // ...additional mock implementations...
    };
  `;
};

module.exports = {
  process(sourceText, sourcePath) {
    if (isCssInteropFile(sourcePath)) {
      return {
        code: createMockImplementation(),
      };
    }
    return {
      code: sourceText,
    };
  },
};
```

#### Benefits:

- **Centralized**: All CSS interop mocking happens in one place
- **Consistent**: Every test gets the same mock implementation
- **Automatic**: No need to manually mock these modules in each test
- **Maintainable**: Easy to update when the library API changes

## Mock Strategies

### Principles of Effective Mocking

1. **Mock at the appropriate level**: Mock as close to the external dependency as possible
2. **Keep mocks simple**: Provide only what's needed for your tests
3. **Avoid deep nesting**: Prefer direct hook mocks over complex provider hierarchies
4. **Type your mocks**: Use TypeScript interfaces for mocked objects to catch errors early

### Component Mocking Examples

For commonly used components, create standardized mock implementations:

```javascript
// In jest.setup.js
jest.mock('@/components/ThemedText', () => ({
  ThemedText: ({ children, style, variant, ...props }) => {
    return {
      type: 'ThemedText',
      props: { children, style, variant, ...props },
      $$typeof: Symbol.for('react.element'),
    };
  }
}));
```

### Context Mocking Example

Prefer direct hook mocking over provider wrappers:

```javascript
// Direct hook mocking with proper types
interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

jest.mock('@/contexts/AuthContext', () => {
  const mockPaymentMethods: PaymentMethod[] = [];
  return {
    useAuth: () => ({
      user: {
        id: '1',
        email: 'test@example.com',
        paymentMethods: mockPaymentMethods,
      },
      updatePaymentMethods: jest.fn().mockImplementation(async (methods: PaymentMethod[]) => {
        mockPaymentMethods.push(...methods);
        return Promise.resolve(true);
      }),
    }),
  };
});
```

## Jest Configuration

### Key Configuration Options

```javascript
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    // Use the custom transformer for CSS interop files
    'node_modules/react-native-css-interop/.*': '<rootDir>/jest/transformers/cssInteropTransformer.js',
    '.*\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Direct mocks for problematic modules
    'react-native-css-interop/src/runtime/native/appearance-observables': '<rootDir>/jest/transformers/cssInteropTransformer.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### Important Configuration Elements

- **transformIgnorePatterns**: Controls which node_modules are transformed
- **setupFilesAfterEnv**: Files to run before tests execute
- **transform**: Maps file patterns to transformer functions
- **moduleNameMapper**: Maps import paths to different modules/files
- **collectCoverageFrom**: Determines which files to include in coverage reports

## Writing Effective Tests

### Component Test Example

```tsx
import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { PaymentMethodForm } from '../PaymentMethodForm';
import { render } from '@/utils/test-utils';

describe('PaymentMethodForm', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const { getByPlaceholderText } = render(
      <PaymentMethodForm 
        onComplete={mockOnComplete} 
        onCancel={mockOnCancel} 
      />
    );

    await waitFor(() => {
      expect(getByPlaceholderText('1234 5678 9012 3456')).toBeTruthy();
    });
  });

  it('submits form with valid data', async () => {
    const { getByPlaceholderText, getByText } = render(
      <PaymentMethodForm 
        onComplete={mockOnComplete} 
        onCancel={mockOnCancel} 
      />
    );

    // Fill out the form
    await waitFor(() => {
      const cardInput = getByPlaceholderText('1234 5678 9012 3456');
      fireEvent.changeText(cardInput, '4242424242424242');
      // ...fill other fields...
    });

    // Submit the form
    const saveButton = getByText('Save Payment Method');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });
});
```

### Testing Patterns

1. **Setup → Action → Assertion**: Follow this pattern in each test
2. **Async rendering**: Always use `waitFor` to handle asynchronous component rendering
3. **Isolated tests**: Each test should be self-contained and not depend on other tests
4. **Typed mocks**: Use TypeScript interfaces for mocks to catch type errors early
5. **Clear descriptions**: Write descriptive test names that explain the expected behavior

## Troubleshooting Common Issues

### CSS Interop Issues

**Problem**: Tests fail with errors related to CSS-in-JS libraries

**Solutions**:
- Use a custom transformer to mock these libraries
- Check transform patterns in Jest config
- Verify the mock API provides all necessary functions

### Async Test Issues

**Problem**: Tests fail with timeout errors or "update was not wrapped in act" warnings

**Solutions**:
- Wrap component interactions in `waitFor`
- Increase the default timeout
- Ensure all promises resolve in tests

### Mock Problems

**Problem**: Components can't access mocked values or functions

**Solutions**:
- Check mock implementation paths match actual imports
- Use direct hook mocks instead of context providers
- Verify mock return values match expected types

### Performance Issues

**Problem**: Tests are slow to run

**Solutions**:
- Use more specific test patterns to run fewer tests
- Move slow setup code to `beforeAll` instead of `beforeEach`
- Mock heavy components that aren't critical to the test

## Conclusion

A well-structured testing approach is critical for maintaining app quality as the codebase grows. The custom transformer approach demonstrated here offers a powerful solution to the common challenges of testing React Native applications with CSS-in-JS libraries.

By following these patterns and practices, you'll create a test suite that is:

- **Reliable**: Tests consistently pass or fail based on actual code behavior
- **Maintainable**: Easy to update as your application evolves
- **Fast**: Quick feedback during development
- **Comprehensive**: Good coverage of important application functionality 