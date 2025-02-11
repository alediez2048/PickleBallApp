import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, Pressable } from 'react-native';
import { UIProvider, useUI } from '../UIContext';

// Test component that uses UI context
const TestComponent: React.FC = () => {
  const { colorScheme, isLoading, toast, setColorScheme, setLoading, showToast, hideToast, useThemeColor } = useUI();
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#000000' }, 'background');

  return (
    <View style={{ backgroundColor }}>
      <Pressable testID="toggle-theme" onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}>
        <Text>Toggle Theme</Text>
      </Pressable>
      <Pressable testID="toggle-loading" onPress={() => setLoading(!isLoading)}>
        <Text>Toggle Loading</Text>
      </Pressable>
      <Pressable testID="show-toast" onPress={() => showToast('Test Toast', 'info')}>
        <Text>Show Toast</Text>
      </Pressable>
      <Pressable testID="hide-toast" onPress={hideToast}>
        <Text>Hide Toast</Text>
      </Pressable>
      <Text testID="color-scheme">{colorScheme}</Text>
      <Text testID="loading-state">{isLoading ? 'loading' : 'not-loading'}</Text>
      <Text testID="toast-state">{toast.visible ? 'visible' : 'hidden'}</Text>
      <Text testID="toast-message">{toast.message}</Text>
      <Text testID="toast-type">{toast.type}</Text>
      <Text testID="background-color">{backgroundColor}</Text>
    </View>
  );
};

describe('UIContext', () => {
  it('provides initial state', () => {
    const { getByTestId } = render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    expect(getByTestId('loading-state')).toHaveTextContent('not-loading');
    expect(getByTestId('toast-state')).toHaveTextContent('hidden');
    expect(getByTestId('toast-message')).toHaveTextContent('');
    expect(getByTestId('toast-type')).toHaveTextContent('info');
  });

  it('toggles loading state', () => {
    const { getByTestId } = render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    fireEvent.press(getByTestId('toggle-loading'));
    expect(getByTestId('loading-state')).toHaveTextContent('loading');

    fireEvent.press(getByTestId('toggle-loading'));
    expect(getByTestId('loading-state')).toHaveTextContent('not-loading');
  });

  it('shows and auto-hides toast', async () => {
    const { getByTestId } = render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    fireEvent.press(getByTestId('show-toast'));
    expect(getByTestId('toast-state')).toHaveTextContent('visible');
    expect(getByTestId('toast-message')).toHaveTextContent('Test Toast');
    expect(getByTestId('toast-type')).toHaveTextContent('info');

    await waitFor(() => {
      expect(getByTestId('toast-state')).toHaveTextContent('hidden');
    }, { timeout: 3500 });
  });

  it('manually hides toast', () => {
    const { getByTestId } = render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    fireEvent.press(getByTestId('show-toast'));
    expect(getByTestId('toast-state')).toHaveTextContent('visible');

    fireEvent.press(getByTestId('hide-toast'));
    expect(getByTestId('toast-state')).toHaveTextContent('hidden');
  });

  it('toggles color scheme', () => {
    const { getByTestId } = render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const initialScheme = getByTestId('color-scheme').props.children;
    fireEvent.press(getByTestId('toggle-theme'));
    expect(getByTestId('color-scheme').props.children).not.toBe(initialScheme);
  });

  it('provides theme colors', () => {
    const { getByTestId } = render(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    const backgroundColor = getByTestId('background-color').props.children;
    expect(backgroundColor).toBe('#ffffff'); // Default light theme
  });
}); 