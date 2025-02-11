import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<Button>Test Button</Button>);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress}>Press Me</Button>
    );

    fireEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const { getByLabelText, queryByText } = render(
      <Button loading>Loading Button</Button>
    );

    expect(getByLabelText('Loading')).toBeTruthy();
    expect(queryByText('Loading Button')).toBeNull();
  });

  it('handles disabled state', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button disabled onPress={onPress}>
        Disabled Button
      </Button>
    );

    fireEvent.press(getByText('Disabled Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies different variants correctly', () => {
    const { rerender, getByRole } = render(
      <Button variant="primary">Primary Button</Button>
    );

    let button = getByRole('button');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#000' })
    );

    rerender(<Button variant="secondary">Secondary Button</Button>);
    button = getByRole('button');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({ backgroundColor: '#fff' })
    );
  });

  it('applies different sizes correctly', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    const { rerender, getByRole } = render(
      <Button size="sm">Size Button</Button>
    );

    sizes.forEach(size => {
      rerender(<Button size={size}>Size Button</Button>);
      const button = getByRole('button');
      const expectedHeight = size === 'sm' ? 32 : size === 'md' ? 40 : 48;
      expect(button.props.style).toContainEqual(
        expect.objectContaining({ height: expectedHeight })
      );
    });
  });

  it('sets proper accessibility props', () => {
    const { getByRole } = render(
      <Button accessibilityLabel="Custom Label">
        Button Text
      </Button>
    );

    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Custom Label');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityState).toEqual({
      disabled: false,
      busy: false,
    });
  });

  it('uses text as accessibility label when not provided', () => {
    const { getByRole } = render(
      <Button>Button Text</Button>
    );

    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Button Text');
  });

  it('handles loading and disabled states together', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <Button loading disabled onPress={onPress}>
        Loading Disabled Button
      </Button>
    );

    const button = getByLabelText('Loading');
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
  });
}); 