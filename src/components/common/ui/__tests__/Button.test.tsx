import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button';
import { View } from 'react-native';

describe('Button', () => {
  it('renders correctly with default props', () => {
    const { getByRole } = render(<Button>Test Button</Button>);
    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(button.props.accessibilityLabel).toBe('Test Button');
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button onPress={onPress}>Press Me</Button>
    );

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows loading state with proper accessibility', () => {
    const { getByRole, getByLabelText } = render(
      <Button loading>Loading Button</Button>
    );

    const button = getByRole('button');
    const spinner = getByLabelText('Loading');
    
    expect(spinner).toBeTruthy();
    expect(button.props.accessibilityState.busy).toBe(true);
  });

  it('handles disabled state with proper accessibility', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Button disabled onPress={onPress}>
        Disabled Button
      </Button>
    );

    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
    
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies different sizes correctly', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    const expectedHeights = { sm: 32, md: 40, lg: 48 };
    
    sizes.forEach(size => {
      const { getByRole } = render(
        <Button size={size}>Size Button</Button>
      );
      const button = getByRole('button');
      const buttonStyles = button.props.style;
      
      const heightStyle = buttonStyles.find(
        (style: any) => style && style.height === expectedHeights[size]
      );
      expect(heightStyle).toBeTruthy();
    });
  });

  it('uses custom accessibility label when provided', () => {
    const { getByRole } = render(
      <Button accessibilityLabel="Custom Label">
        Button Text
      </Button>
    );

    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Custom Label');
  });

  it('uses accessibility hint when provided', () => {
    const { getByRole } = render(
      <Button accessibilityHint="This button does something">
        Button Text
      </Button>
    );

    const button = getByRole('button');
    expect(button.props.accessibilityHint).toBe('This button does something');
  });

  it('handles non-text children with proper accessibility', () => {
    const { getByRole } = render(
      <Button accessibilityLabel="Icon Button">
        <View testID="icon" />
      </Button>
    );

    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Icon Button');
  });

  it('maintains accessibility state during loading and disabled states', () => {
    const { getByRole, rerender } = render(
      <Button disabled loading>
        Test Button
      </Button>
    );

    const button = getByRole('button');
    expect(button.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });

    rerender(
      <Button disabled={false} loading={false}>
        Test Button
      </Button>
    );

    expect(button.props.accessibilityState).toEqual({
      disabled: false,
      busy: false,
    });
  });

  it('handles text overflow properly', () => {
    const { getByText } = render(
      <Button>
        Very long button text that should be truncated if it exceeds the available space
      </Button>
    );

    const text = getByText(
      'Very long button text that should be truncated if it exceeds the available space'
    );
    expect(text.props.numberOfLines).toBe(1);
  });
}); 