import React from 'react';
import renderer from 'react-test-renderer';
import { Button } from '../Button';
import { TouchableOpacity } from 'react-native';

// Mock UIProvider context
jest.mock('@/contexts/UIContext', () => ({
  UIProvider: ({ children }: { children: React.ReactNode }) => children,
  useUIState: () => ({
    colorScheme: 'light',
    theme: 'default'
  }),
  useThemedColor: () => ({
    primary: '#4CAF50',
    secondary: '#2196F3',
    text: '#333333',
    background: '#FFFFFF'
  })
}));

describe('Button', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const tree = renderer
      .create(<Button>Test Button</Button>)
      .toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly with different sizes', () => {
    const smallTree = renderer
      .create(<Button size="small">Small Button</Button>)
      .toJSON();
    
    const mediumTree = renderer
      .create(<Button size="medium">Medium Button</Button>)
      .toJSON();
    
    const largeTree = renderer
      .create(<Button size="large">Large Button</Button>)
      .toJSON();
    
    expect(smallTree).toMatchSnapshot('small size');
    expect(mediumTree).toMatchSnapshot('medium size');
    expect(largeTree).toMatchSnapshot('large size');
  });

  it('renders correctly with different variants', () => {
    const primaryTree = renderer
      .create(<Button variant="primary">Primary Button</Button>)
      .toJSON();
    
    const secondaryTree = renderer
      .create(<Button variant="secondary">Secondary Button</Button>)
      .toJSON();
    
    const outlineTree = renderer
      .create(<Button variant="outline">Outline Button</Button>)
      .toJSON();
    
    expect(primaryTree).toMatchSnapshot('primary variant');
    expect(secondaryTree).toMatchSnapshot('secondary variant');
    expect(outlineTree).toMatchSnapshot('outline variant');
  });

  it('renders correctly in loading state', () => {
    const tree = renderer
      .create(<Button loading>Loading Button</Button>)
      .toJSON();
    
    expect(tree).toMatchSnapshot('loading state');
  });

  it('renders correctly in disabled state', () => {
    const tree = renderer
      .create(<Button disabled>Disabled Button</Button>)
      .toJSON();
    
    expect(tree).toMatchSnapshot('disabled state');
  });

  it('renders correctly with full width', () => {
    const tree = renderer
      .create(<Button fullWidth>Full Width Button</Button>)
      .toJSON();
    
    expect(tree).toMatchSnapshot('full width');
  });

  it('renders correctly with accessibility props', () => {
    const tree = renderer
      .create(
        <Button 
          accessibilityLabel="Custom Label"
          accessibilityHint="This button does something"
        >
          Accessible Button
        </Button>
      )
      .toJSON();
    
    expect(tree).toMatchSnapshot('accessibility props');
  });

  it('renders correctly with icon children', () => {
    const tree = renderer
      .create(
        <Button accessibilityLabel="Icon Button">
          <React.Fragment>Icon</React.Fragment>
        </Button>
      )
      .toJSON();
    
    expect(tree).toMatchSnapshot('icon children');
  });

  it('renders correctly in loading and disabled state', () => {
    const tree = renderer
      .create(<Button loading disabled>Loading Disabled Button</Button>)
      .toJSON();
    
    expect(tree).toMatchSnapshot('loading and disabled');
  });
}); 