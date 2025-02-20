import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import { Button } from '../Button';
import { UIProvider } from '@/contexts/UIContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UIProvider>{children}</UIProvider>
);

describe('Button', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<Button>Test Button</Button>, { wrapper });
    const button = getByText('Test Button');
    expect(button).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button onPress={onPress}>Press Me</Button>,
      { wrapper }
    );

    fireEvent.press(getByTestId('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows loading state with proper accessibility', () => {
    const { getByTestId, queryByText } = render(
      <Button loading>Test Button</Button>,
      { wrapper }
    );

    const spinner = getByTestId('loading-spinner');
    expect(spinner).toBeTruthy();
    expect(queryByText('Test Button')).toBeNull();
  });

  it('handles disabled state with proper accessibility', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button onPress={onPress} disabled>
        Disabled Button
      </Button>,
      { wrapper }
    );

    const button = getByTestId('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
    
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies different sizes correctly', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach(size => {
      const { getByTestId } = render(
        <Button size={size}>Size Button</Button>,
        { wrapper }
      );
      const button = getByTestId('button');
      const buttonStyles = button.props.style;
      
      // Find the size-specific style in the array
      const sizeStyle = buttonStyles.find((style: any) => 
        style && (
          (size === 'small' && style.paddingVertical === 8) ||
          (size === 'medium' && style.paddingVertical === 12) ||
          (size === 'large' && style.paddingVertical === 16)
        )
      );
      
      expect(sizeStyle).toBeTruthy();
    });
  });

  it('uses custom accessibility label when provided', () => {
    const { getByTestId } = render(
      <Button accessibilityLabel="Custom Label">Button Text</Button>,
      { wrapper }
    );
    const button = getByTestId('button');
    expect(button.props.accessibilityLabel).toBe('Custom Label');
  });

  it('uses accessibility hint when provided', () => {
    const { getByTestId } = render(
      <Button accessibilityHint="This button does something">
        Button Text
      </Button>,
      { wrapper }
    );
    const button = getByTestId('button');
    expect(button.props.accessibilityHint).toBe('This button does something');
  });

  it('handles non-text children with proper accessibility', () => {
    const { getByTestId } = render(
      <Button accessibilityLabel="Icon Button">
        <View testID="icon" />
      </Button>,
      { wrapper }
    );
    const button = getByTestId('button');
    expect(button.props.accessibilityLabel).toBe('Icon Button');
  });

  it('maintains accessibility state during loading and disabled states', () => {
    const { getByTestId } = render(
      <Button loading disabled>
        Test Button
      </Button>,
      { wrapper }
    );
    const button = getByTestId('button');
    expect(button.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
  });

  it('applies variant styles correctly', () => {
    const variants = ['primary', 'secondary', 'outline'] as const;
    variants.forEach(variant => {
      const { getByTestId } = render(
        <Button variant={variant}>Variant Button</Button>,
        { wrapper }
      );
      const button = getByTestId('button');
      const buttonStyles = button.props.style;
      
      // Find the variant-specific style in the array
      const variantStyle = buttonStyles.find((style: any) => 
        style && (
          (variant === 'primary' && style.backgroundColor === '#4CAF50') ||
          (variant === 'secondary' && style.backgroundColor === '#2196F3') ||
          (variant === 'outline' && style.backgroundColor === 'transparent')
        )
      );
      
      expect(variantStyle).toBeTruthy();
    });
  });

  it('applies fullWidth style when specified', () => {
    const { getByTestId } = render(
      <Button fullWidth>Full Width Button</Button>,
      { wrapper }
    );
    const button = getByTestId('button');
    const buttonStyles = button.props.style;
    
    // Find the fullWidth style in the array
    const fullWidthStyle = buttonStyles.find((style: any) => 
      style && style.width === '100%'
    );
    
    expect(fullWidthStyle).toBeTruthy();
  });
}); 