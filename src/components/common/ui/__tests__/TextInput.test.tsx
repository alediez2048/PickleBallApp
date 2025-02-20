import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, TextInput as RNTextInput } from 'react-native';
import { TextInput } from '../TextInput';

describe('TextInput', () => {
  it('renders correctly with basic props', () => {
    const { getByTestId } = render(
      <TextInput label="Username" placeholder="Enter username" />
    );
    
    const input = getByTestId('text-input');
    expect(input).toBeTruthy();
    expect(input.props.accessibilityLabel).toBe('Username');
  });

  it('handles text input correctly', () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <TextInput
        label="Username"
        placeholder="Enter username"
        onChangeText={onChangeText}
      />
    );

    const input = getByTestId('text-input');
    fireEvent.changeText(input, 'test-user');
    expect(onChangeText).toHaveBeenCalledWith('test-user');
  });

  it('displays error message with proper accessibility', () => {
    const { getByText, getByTestId } = render(
      <TextInput
        label="Password"
        error="Password is required"
      />
    );

    const input = getByTestId('text-input');
    const errorMessage = getByText('Password is required');

    expect(errorMessage.props.accessibilityRole).toBe('text');
    expect(input.props.accessibilityHint).toBe('Password is required');
  });

  it('displays helper text with proper accessibility', () => {
    const { getByText, getByTestId } = render(
      <TextInput
        label="Email"
        helperText="We'll never share your email"
      />
    );

    const input = getByTestId('text-input');
    const helperText = getByText("We'll never share your email");

    expect(helperText.props.accessibilityRole).toBe('text');
    expect(input.props.accessibilityHint).toBe("We'll never share your email");
  });

  it('handles disabled state correctly', () => {
    const { getByTestId } = render(
      <TextInput
        label="Username"
        editable={false}
      />
    );

    const input = getByTestId('text-input');
    expect(input.props.accessibilityState.disabled).toBe(true);
    expect(input.props.editable).toBe(false);
  });

  it('handles start icon correctly', () => {
    const { getByTestId } = render(
      <TextInput
        label="Search"
        startIcon={<View testID="start-icon" />}
      />
    );

    const startIcon = getByTestId('start-icon');
    expect(startIcon).toBeTruthy();
  });

  it('handles end icon with press handler correctly', () => {
    const onEndIconPress = jest.fn();
    const { getByTestId } = render(
      <TextInput
        label="Password"
        endIcon={<View testID="end-icon" />}
        onEndIconPress={onEndIconPress}
      />
    );

    const endIconButton = getByTestId('end-icon-button');
    fireEvent.press(endIconButton);
    expect(onEndIconPress).toHaveBeenCalled();
  });

  it('handles end icon without press handler correctly', () => {
    const { getByTestId } = render(
      <TextInput
        label="Password"
        endIcon={<View testID="end-icon" />}
      />
    );

    const endIcon = getByTestId('end-icon');
    expect(endIcon).toBeTruthy();
  });

  it('associates label with input using accessibilityLabel', () => {
    const { getByText, getByTestId } = render(
      <TextInput label="Username" />
    );

    const label = getByText('Username');
    const input = getByTestId('text-input');
    
    expect(input.props.accessibilityLabel).toBe('Username');
    expect(label.props.accessibilityRole).toBe('text');
  });

  it('associates helper/error text with input using accessibilityHint', () => {
    const { getByTestId, rerender } = render(
      <TextInput
        label="Username"
        helperText="Enter your username"
      />
    );

    const input = getByTestId('text-input');
    expect(input.props.accessibilityHint).toBe('Enter your username');

    // Test with error
    rerender(
      <TextInput
        label="Username"
        error="Username is required"
      />
    );

    expect(input.props.accessibilityHint).toBe('Username is required');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<RNTextInput>();
    const { getByTestId } = render(
      <TextInput ref={ref} label="Username" />
    );
    
    const input = getByTestId('text-input');
    expect(input).toBeTruthy();
    expect(ref.current).toBeTruthy();
  });
}); 