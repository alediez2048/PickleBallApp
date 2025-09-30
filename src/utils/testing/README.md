# Testing Utilities

This directory contains utilities to help with testing React Native components. The primary goal is to provide tools that avoid common testing pitfalls in React Native.

## Available Utilities

### `renderWithoutUnmounting.ts`

This utility helps prevent the "Can't access .root on unmounted test renderer" error by managing component lifecycle properly.

Key functions:

- `render(component)`: Safely renders a component and tracks it for proper cleanup
- `cleanupRenderedComponents()`: Cleans up all rendered components 
- `expectTextContent(component, text)`: Utility to check text content in rendered components
- `getAllTextContent(component)`: Extracts all text content from a component tree
- `setup()`: Automatically sets up Jest to clean components between tests

## Usage Examples

### Basic Usage

```javascript
import { render, cleanupRenderedComponents } from '../utils/testing/renderWithoutUnmounting';

describe('MyComponent', () => {
  afterEach(() => {
    cleanupRenderedComponents();
  });

  it('renders correctly', () => {
    const component = render(<MyComponent />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
```

### With Text Content Assertions

```javascript
import { render, expectTextContent } from '../utils/testing/renderWithoutUnmounting';

it('displays the correct text', () => {
  const component = render(<WelcomeMessage name="John" />);
  expectTextContent(component, "Welcome, John!");
});
```

## Best Practices

1. Always clean up components after tests using `cleanupRenderedComponents()`
2. For simple component rendering tests, prefer direct snapshot testing with `react-test-renderer` over these utilities
3. Use these utilities when you need more complex test scenarios or assertions

## Related Resources

For more information about our testing approach, see the project's [TESTING.md](../../../TESTING.md) file. 