# Comprehensive Testing Infrastructure Reference Guide

## 1. Documentation Summaries

### TESTING.md
This document serves as the main testing guide for the PickleBallApp project. It outlines:
- The challenges faced during React Native testing (unmounted renderer errors, mock implementation issues)
- Our snapshot testing approach using `react-test-renderer`
- Mock setup patterns for various components and CSS interop modules
- Helper utilities to prevent common React Native testing errors
- Examples of different test types (simple snapshots, complex state testing)
- Coverage goals (70% for statements, branches, functions, and lines)

### COMPREHENSIVE_TEST_SETUP.md
This is a detailed technical guide that explains:
- In-depth explanation of the testing infrastructure components (Jest, transformers, mocks)
- Implementation details of our custom CSS Interop transformer
- Principles and examples of effective mocking strategies
- Jest configuration options and their importance
- Detailed patterns for writing component, hook, and context tests
- Troubleshooting guidance for common issues in React Native testing

### src/utils/testing/README.md
This provides documentation specifically for our custom testing utilities:
- Details on the `renderWithoutUnmounting.ts` utility
- Usage examples for the testing utilities
- Best practices for using these utilities effectively

## 2. Setup & Configuration Guidelines

### Jest Configuration

1. **Install Dependencies:**
   ```bash
   npm install --save-dev jest jest-expo @testing-library/react-native react-test-renderer
   ```

2. **Configure Jest in package.json:**
   ```json
   "jest": {
     "preset": "jest-expo",
     "transformIgnorePatterns": [
       "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
     ],
     "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
     "transform": {
       "node_modules/react-native-css-interop/.*": "<rootDir>/jest/transformers/cssInteropTransformer.js"
     },
     "collectCoverage": true,
     "coverageThreshold": {
       "global": {
         "branches": 70,
         "functions": 70,
         "lines": 70,
         "statements": 70
       }
     }
   }
   ```

3. **Create CSS Interop Transformer:**
   Create file at `jest/transformers/cssInteropTransformer.js`:
   ```javascript
   const isCssInteropFile = (filename) => {
     return filename.includes('react-native-css-interop') ||
            filename.includes('@expo/stylesheets');
   };

   const createMockImplementation = () => {
     return `
       module.exports = {
         css: function() { return function() { return {}; }; },
         withStyleSheet: function(styles) { return function(component) { return component; }; },
         getColorScheme: () => 'light',
         addAppearanceListener: () => ({ remove: () => {} }),
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

4. **Setup Jest Global Config:**
   Create `jest.setup.js` file in the project root:
   ```javascript
   import { NativeModules as RNNativeModules } from 'react-native';
   
   // Mock components
   jest.mock('@/components/ThemedText', () => ({
     ThemedText: ({ children, style, variant, ...props }) => ({
       type: 'ThemedText',
       props: { children, style, variant, ...props },
       $$typeof: Symbol.for('react.element'),
     }),
   }));

   // Mock CSS Interop modules
   jest.mock('react-native-css-interop/src/runtime/native/appearance-observables', () => ({
     getColorScheme: jest.fn().mockReturnValue('light'),
     addAppearanceListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
     addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
     resetAppearanceListeners: jest.fn(),
   }));
   ```

5. **Create renderWithoutUnmounting Utility:**
   Create file at `src/utils/testing/renderWithoutUnmounting.ts`:
   ```typescript
   import React from 'react';
   import renderer, { ReactTestRenderer, ReactTestInstance } from 'react-test-renderer';

   // Track rendered components for cleanup
   const renderedComponents: ReactTestRenderer[] = [];

   export function render(component: React.ReactElement) {
     const renderedComponent = renderer.create(component);
     renderedComponents.push(renderedComponent);
     
     return {
       renderer: renderedComponent,
       getByTestId: (testId: string) => getByTestId(renderedComponent.root, testId),
       getByText: (text: string) => getByText(renderedComponent.root, text),
       getAllByTestId: (testId: string) => getAllByTestId(renderedComponent.root, testId),
       queryByTestId: (testId: string) => queryByTestId(renderedComponent.root, testId),
       unmount: () => renderedComponent.unmount(),
     };
   }

   export function cleanup() {
     while (renderedComponents.length > 0) {
       const component = renderedComponents.pop();
       if (component) component.unmount();
     }
   }
   
   // Helper methods implementation (getByTestId, getByText, etc.)
   ```

## 3. Resource References

### Key Libraries
- **Jest**: https://jestjs.io/
- **react-test-renderer**: https://reactjs.org/docs/test-renderer.html
- **jest-expo**: https://github.com/expo/expo/tree/master/packages/jest-expo

### Custom Utilities
- **renderWithoutUnmounting.ts**: Custom utility for safe component rendering and querying in tests
- **cssInteropTransformer.js**: Custom transformer for mocking CSS-in-JS modules

### Mock Implementation Examples

#### Component Mocks
```javascript
jest.mock('@/components/common/ui/Button', () => ({
  Button: ({ children, onPress, ...props }) => ({
    type: 'Button',
    props: { children, onPress, ...props },
    $$typeof: Symbol.for('react.element'),
  }),
}));
```

#### Context Mocks
```javascript
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { 
      id: '1', 
      email: 'test@example.com',
      isVerified: true 
    },
    signIn: jest.fn().mockImplementation(() => Promise.resolve()),
    signOut: jest.fn().mockImplementation(() => Promise.resolve()),
    isAuthenticated: true,
  }),
}));
```

#### Navigation Mocks
```javascript
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({ id: 'game-123' }),
}));
```

## 4. Best Practices & Lessons Learned

### Critical Insights

1. **Avoid Unmounted Renderer Errors**
   - Use our custom `renderWithoutUnmounting` utility instead of React Native Testing Library's render function
   - Always clean up components between tests to prevent memory leaks and test interference

2. **Mock Implementation Strategies**
   - Mock dependencies as close to the external boundary as possible
   - For contexts, mock the hook function directly instead of wrapping components with providers
   - When mocking hooks, ensure return values match expected types (use TypeScript interfaces)
   - Define mock factories for complex objects like Game or User

3. **CSS-in-JS Solutions**
   - Use the custom transformer approach for CSS interop modules
   - Avoid importing actual style components in tests
   - Provide consistent mocks for appearance-related functions (getColorScheme, etc.)

4. **Snapshot Testing Best Practices**
   - Keep snapshots focused on specific component states rather than entire screens
   - Create snapshot tests for all meaningful component variants (loading, error, empty, populated)
   - Compare snapshot differences carefully during code reviews
   - Use descriptive snapshot names with `.toMatchSnapshot('state description')`

5. **Testing Structure**
   - Place tests in `__tests__` directories adjacent to the code being tested
   - Use nested `describe` blocks to organize related tests
   - Follow the Arrange-Act-Assert (AAA) pattern within test cases
   - Test components in isolation from their dependencies

6. **Performance Considerations**
   - Mock heavy components that aren't critical to the test
   - Use more specific test patterns to run fewer tests during development
   - Move slow setup code to `beforeAll` instead of `beforeEach`

7. **Error Handling & Debugging**
   - When tests fail with "update was not wrapped in act" warnings, wrap component interactions in `waitFor`
   - For mock problems, verify mock implementation paths match actual imports
   - Use direct hook mocks instead of complex context providers
   - If coverage is poor, prioritize core user flows and critical components first

### Coverage Targets
- 70% statement coverage
- 70% branch coverage
- 70% function coverage
- 70% line coverage

### Test Running Commands
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npx jest src/components/payment/__tests__/PaymentMethodForm.test.tsx

# Update snapshots
npx jest -u
```

## 5. Current Testing Status

As of the last update, our testing infrastructure includes:
- 158 total tests across 29 test suites
- 125 passing tests (79% success rate)
- 94 passing snapshots
- Current coverage is below our 70% targets, but we're focused on improving this

The shift to snapshot testing with react-test-renderer has been successful, fixing many of the issues we encountered with React Native Testing Library. 