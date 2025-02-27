import React from 'react';
import renderer from 'react-test-renderer';
import { UIProvider } from '../../UIContext';
import {
  useThemeMode,
  useLoadingState,
  useToastState,
  useThemedColor,
} from '../uiSelectors';
import { ColorSchemeName } from 'react-native';

interface MockUIContext {
  colorScheme: ColorSchemeName;
  isLoading: boolean;
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  };
  useThemeColor: (
    props: { light?: string; dark?: string },
    colorName: string
  ) => string;
}

const mockUIContext: MockUIContext = {
  colorScheme: 'light',
  isLoading: false,
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },
  useThemeColor: (props, colorName): string => 
    props[mockUIContext.colorScheme as 'light' | 'dark'] || '#000000',
};

jest.mock('../../UIContext', () => ({
  UIProvider: ({ children }: { children: React.ReactNode }) => children,
  useUI: () => mockUIContext,
}));

// Create components to test each hook
const ThemeModeComponent: React.FC = () => {
  const themeMode = useThemeMode();
  return (
    <div data-testid="theme-mode">
      <div>isDark: {themeMode.isDark ? 'true' : 'false'}</div>
      <div>isLight: {themeMode.isLight ? 'true' : 'false'}</div>
      <div>current: {themeMode.current}</div>
    </div>
  );
};

const LoadingStateComponent: React.FC = () => {
  const loadingState = useLoadingState();
  return (
    <div data-testid="loading-state">
      <div>isLoading: {loadingState.isLoading ? 'true' : 'false'}</div>
      <div>isReady: {loadingState.isReady ? 'true' : 'false'}</div>
    </div>
  );
};

const ToastStateComponent: React.FC = () => {
  const toastState = useToastState();
  return (
    <div data-testid="toast-state">
      <div>visible: {toastState.visible ? 'true' : 'false'}</div>
      <div>message: {toastState.message}</div>
      <div>type: {toastState.type}</div>
      <div>isSuccess: {toastState.isSuccess ? 'true' : 'false'}</div>
      <div>isError: {toastState.isError ? 'true' : 'false'}</div>
      <div>isInfo: {toastState.isInfo ? 'true' : 'false'}</div>
    </div>
  );
};

interface ThemedColorProps {
  colorName: string;
  lightColor?: string;
  darkColor?: string;
}

const ThemedColorComponent: React.FC<ThemedColorProps> = ({ 
  colorName, 
  lightColor,
  darkColor
}) => {
  const color = useThemedColor(colorName, lightColor, darkColor);
  return (
    <div data-testid="themed-color" style={{ color }}>
      {color}
    </div>
  );
};

describe('UI Selectors', () => {
  const wrapper = (component: React.ReactElement) => (
    <UIProvider>{component}</UIProvider>
  );

  describe('useThemeMode', () => {
    it('returns correct theme mode state for light theme', () => {
      mockUIContext.colorScheme = 'light';
      const tree = renderer.create(wrapper(<ThemeModeComponent />)).toJSON();
      expect(tree).toMatchSnapshot('light theme');
    });

    it('returns correct theme mode state for dark theme', () => {
      mockUIContext.colorScheme = 'dark';
      const tree = renderer.create(wrapper(<ThemeModeComponent />)).toJSON();
      expect(tree).toMatchSnapshot('dark theme');
    });
  });

  describe('useLoadingState', () => {
    it('returns correct loading state when not loading', () => {
      mockUIContext.isLoading = false;
      const tree = renderer.create(wrapper(<LoadingStateComponent />)).toJSON();
      expect(tree).toMatchSnapshot('not loading');
    });

    it('returns correct loading state when loading', () => {
      mockUIContext.isLoading = true;
      const tree = renderer.create(wrapper(<LoadingStateComponent />)).toJSON();
      expect(tree).toMatchSnapshot('loading');
    });
  });

  describe('useToastState', () => {
    it('returns correct toast state when toast is hidden', () => {
      mockUIContext.toast = {
        visible: false,
        message: '',
        type: 'info',
      };
      const tree = renderer.create(wrapper(<ToastStateComponent />)).toJSON();
      expect(tree).toMatchSnapshot('hidden toast');
    });

    it('returns correct toast state for success toast', () => {
      mockUIContext.toast = {
        visible: true,
        message: 'Success message',
        type: 'success',
      };
      const tree = renderer.create(wrapper(<ToastStateComponent />)).toJSON();
      expect(tree).toMatchSnapshot('success toast');
    });
  });

  describe('useThemedColor', () => {
    it('returns correct color for light theme', () => {
      mockUIContext.colorScheme = 'light';
      const tree = renderer.create(
        wrapper(<ThemedColorComponent colorName="background" lightColor="#ffffff" darkColor="#000000" />)
      ).toJSON();
      expect(tree).toMatchSnapshot('light mode color');
    });

    it('returns correct color for dark theme', () => {
      mockUIContext.colorScheme = 'dark';
      const tree = renderer.create(
        wrapper(<ThemedColorComponent colorName="background" lightColor="#ffffff" darkColor="#000000" />)
      ).toJSON();
      expect(tree).toMatchSnapshot('dark mode color');
    });

    it('returns default color when no custom colors provided', () => {
      const tree = renderer.create(
        wrapper(<ThemedColorComponent colorName="background" />)
      ).toJSON();
      expect(tree).toMatchSnapshot('default themed color');
    });
  });
}); 