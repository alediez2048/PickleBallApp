import React from 'react';
import { renderHook } from '@testing-library/react-native';
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

describe('UI Selectors', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UIProvider>{children}</UIProvider>
  );

  describe('useThemeMode', () => {
    it('returns correct theme mode state for light theme', () => {
      mockUIContext.colorScheme = 'light';
      const { result } = renderHook(() => useThemeMode(), { wrapper });
      expect(result.current).toEqual({
        isDark: false,
        isLight: true,
        current: 'light',
      });
    });

    it('returns correct theme mode state for dark theme', () => {
      mockUIContext.colorScheme = 'dark';
      const { result } = renderHook(() => useThemeMode(), { wrapper });
      expect(result.current).toEqual({
        isDark: true,
        isLight: false,
        current: 'dark',
      });
    });
  });

  describe('useLoadingState', () => {
    it('returns correct loading state when not loading', () => {
      mockUIContext.isLoading = false;
      const { result } = renderHook(() => useLoadingState(), { wrapper });
      expect(result.current).toEqual({
        isLoading: false,
        isReady: true,
      });
    });

    it('returns correct loading state when loading', () => {
      mockUIContext.isLoading = true;
      const { result } = renderHook(() => useLoadingState(), { wrapper });
      expect(result.current).toEqual({
        isLoading: true,
        isReady: false,
      });
    });
  });

  describe('useToastState', () => {
    it('returns correct toast state when toast is hidden', () => {
      mockUIContext.toast = {
        visible: false,
        message: '',
        type: 'info',
      };
      const { result } = renderHook(() => useToastState(), { wrapper });
      expect(result.current).toEqual({
        visible: false,
        message: '',
        type: 'info',
        isSuccess: false,
        isError: false,
        isInfo: true,
      });
    });

    it('returns correct toast state for success toast', () => {
      mockUIContext.toast = {
        visible: true,
        message: 'Success message',
        type: 'success',
      };
      const { result } = renderHook(() => useToastState(), { wrapper });
      expect(result.current).toEqual({
        visible: true,
        message: 'Success message',
        type: 'success',
        isSuccess: true,
        isError: false,
        isInfo: false,
      });
    });
  });

  describe('useThemedColor', () => {
    it('returns correct color for light theme', () => {
      mockUIContext.colorScheme = 'light';
      const { result } = renderHook(
        () => useThemedColor('background', '#ffffff', '#000000'),
        { wrapper }
      );
      expect(result.current).toBe('#ffffff');
    });

    it('returns correct color for dark theme', () => {
      mockUIContext.colorScheme = 'dark';
      const { result } = renderHook(
        () => useThemedColor('background', '#ffffff', '#000000'),
        { wrapper }
      );
      expect(result.current).toBe('#000000');
    });

    it('returns default color when no custom colors provided', () => {
      const { result } = renderHook(
        () => useThemedColor('background'),
        { wrapper }
      );
      expect(result.current).toBe('#000000');
    });
  });
}); 