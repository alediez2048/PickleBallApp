import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { View, Text, Pressable } from 'react-native';
import { UIProvider, useUI } from '../UIContext';

// Mock timers for toast auto-hide behavior
jest.useFakeTimers();

// Test component that uses UI context
const TestComponent: React.FC = () => {
  const { colorScheme, isLoading, toast, setColorScheme, setLoading, showToast, hideToast, useThemeColor } = useUI();
  const backgroundColor = useThemeColor({ light: '#ffffff', dark: '#000000' }, 'background');

  return (
    <View style={{ backgroundColor }} testID="test-container">
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
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('provides initial state', () => {
    const tree = renderer
      .create(
        <UIProvider>
          <TestComponent />
        </UIProvider>
      )
      .toJSON();
    
    expect(tree).toMatchSnapshot('initial state');
  });

  it('toggles loading state', () => {
    const component = renderer.create(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // Get initial snapshot
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot('before loading');

    // Toggle loading state
    act(() => {
      const toggleButton = component.root.findByProps({ testID: 'toggle-loading' });
      toggleButton.props.onPress();
    });

    // Get updated snapshot
    tree = component.toJSON();
    expect(tree).toMatchSnapshot('after loading enabled');

    // Toggle loading state again
    act(() => {
      const toggleButton = component.root.findByProps({ testID: 'toggle-loading' });
      toggleButton.props.onPress();
    });

    // Get final snapshot
    tree = component.toJSON();
    expect(tree).toMatchSnapshot('after loading disabled');
  });

  it('shows and auto-hides toast', () => {
    const component = renderer.create(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // Get initial snapshot
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot('before showing toast');

    // Show toast
    act(() => {
      const showToastButton = component.root.findByProps({ testID: 'show-toast' });
      showToastButton.props.onPress();
    });

    // Get snapshot after showing toast
    tree = component.toJSON();
    expect(tree).toMatchSnapshot('after showing toast');

    // Fast-forward toast auto-hide timeout
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Get snapshot after toast auto-hidden
    tree = component.toJSON();
    expect(tree).toMatchSnapshot('after toast auto-hidden');
  });

  it('manually hides toast', () => {
    const component = renderer.create(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // Show toast
    act(() => {
      const showToastButton = component.root.findByProps({ testID: 'show-toast' });
      showToastButton.props.onPress();
    });

    // Get snapshot after showing toast
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot('with visible toast');

    // Manually hide toast
    act(() => {
      const hideToastButton = component.root.findByProps({ testID: 'hide-toast' });
      hideToastButton.props.onPress();
    });

    // Get snapshot after manually hiding toast
    tree = component.toJSON();
    expect(tree).toMatchSnapshot('after manually hiding toast');
  });

  it('toggles color scheme', () => {
    const component = renderer.create(
      <UIProvider>
        <TestComponent />
      </UIProvider>
    );

    // Get initial snapshot
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot('with initial color scheme');

    // Toggle color scheme
    act(() => {
      const toggleThemeButton = component.root.findByProps({ testID: 'toggle-theme' });
      toggleThemeButton.props.onPress();
    });

    // Get snapshot after theme toggle
    tree = component.toJSON();
    expect(tree).toMatchSnapshot('after toggling color scheme');
  });
}); 