import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextInput } from '../TextInput';
import { View, Text } from 'react-native';

describe('TextInput', () => {
  it('renders correctly with basic props', () => {
    const { getByRole } = render(
      <TextInput label="Username" placeholder="Enter username" />
    );
    
    const input = getByRole('textbox');
    expect(input).toBeTruthy();
    expect(input.props.accessibilityLabel).toBe('Username');
  });

  it('handles text input correctly', () => {
    const onChangeText = jest.fn();
    const { getByRole } = render(
      <TextInput
        label="Username"
        placeholder="Enter username"
        onChangeText={onChangeText}
      />
    );

    const input = getByRole('textbox');
    fireEvent.changeText(input, 'test-user');
    expect(onChangeText).toHaveBeenCalledWith('test-user');
  });

  it('displays error message with proper accessibility', () => {
    const { getByText, getByRole } = render(
      <TextInput
        label="Password"
        error="Password is required"
      />
    );

    const input = getByRole('textbox');
    const errorMessage = getByText('Password is required');

    expect(errorMessage.props.accessibilityRole).toBe('text');
    expect(errorMessage.props.accessibilityLiveRegion).toBe('polite');
    expect(input.props.accessibilityState.invalid).toBe(true);
  });

  it('displays helper text with proper accessibility', () => {
    const { getByText, getByRole } = render(
      <TextInput
        label="Email"
        helperText="We'll never share your email"
      />
    );

    const input = getByRole('textbox');
    const helperText = getByText("We'll never share your email");

    expect(helperText.props.accessibilityRole).toBe('text');
    expect(helperText.props.accessibilityLiveRegion).toBe('none');
    expect(input.props.accessibilityState.invalid).toBe(false);
  });

  it('handles disabled state correctly', () => {
    const { getByRole } = render(
      <TextInput
        label="Username"
        editable={false}
      />
    );

    const input = getByRole('textbox');
    expect(input.props.accessibilityState.disabled).toBe(true);
  });

  it('handles start icon correctly', () => {
    const { getByRole } = render(
      <TextInput
        label="Search"
        startIcon={<View testID="start-icon" />}
      />
    );

    const iconContainer = getByRole('image');
    expect(iconContainer).toBeTruthy();
  });

  it('handles end icon with press handler correctly', () => {
    const onEndIconPress = jest.fn();
    const { getByRole } = render(
      <TextInput
        label="Password"
        endIcon={<View testID="end-icon" />}
        onEndIconPress={onEndIconPress}
      />
    );

    const button = getByRole('button');
    fireEvent.press(button);
    expect(onEndIconPress).toHaveBeenCalled();
    expect(button.props.accessibilityLabel).toBe('Toggle password visibility');
  });

  it('handles end icon without press handler correctly', () => {
    const { getByRole, queryByRole } = render(
      <TextInput
        label="Password"
        endIcon={<View testID="end-icon" />}
      />
    );

    expect(queryByRole('button')).toBeNull();
    expect(getByRole('image')).toBeTruthy();
  });

  it('associates label with input using accessibilityLabelledBy', () => {
    const { getByText, getByRole } = render(
      <TextInput label="Username" />
    );

    const label = getByText('Username');
    const input = getByRole('textbox');
    const labelId = label.props.nativeID;
    
    expect(input.props.accessibilityLabelledBy).toBe(labelId);
  });

  it('associates helper/error text with input using accessibilityDescribedBy', () => {
    const { getByText, getByRole, rerender } = render(
      <TextInput
        label="Username"
        helperText="Enter your username"
      />
    );

    const helperText = getByText('Enter your username');
    const input = getByRole('textbox');
    const helperTextId = helperText.props.nativeID;
    
    expect(input.props.accessibilityDescribedBy).toBe(helperTextId);

    // Test with error
    rerender(
      <TextInput
        label="Username"
        error="Username is required"
      />
    );

    const errorText = getByText('Username is required');
    const errorTextId = errorText.props.nativeID;
    
    expect(input.props.accessibilityDescribedBy).toBe(errorTextId);
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<any>();
    render(<TextInput ref={ref} />);
    
    expect(ref.current).toBeTruthy();
    expect(typeof ref.current.focus).toBe('function');
    expect(typeof ref.current.blur).toBe('function');
  });
}); 