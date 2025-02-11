import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { ColorSchemeName, useColorScheme as useRNColorScheme } from 'react-native';

// State interface
interface UIState {
  colorScheme: ColorSchemeName;
  isLoading: boolean;
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  };
}

// Action types
type UIAction =
  | { type: 'SET_COLOR_SCHEME'; payload: ColorSchemeName }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'HIDE_TOAST' };

// Initial state
const initialState: UIState = {
  colorScheme: 'light',
  isLoading: false,
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },
};

// Reducer
function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_COLOR_SCHEME':
      return { ...state, colorScheme: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SHOW_TOAST':
      return {
        ...state,
        toast: {
          visible: true,
          message: action.payload.message,
          type: action.payload.type,
        },
      };
    case 'HIDE_TOAST':
      return {
        ...state,
        toast: {
          ...state.toast,
          visible: false,
        },
      };
    default:
      return state;
  }
}

// Context interface
interface UIContextType extends UIState {
  setColorScheme: (scheme: ColorSchemeName) => void;
  setLoading: (isLoading: boolean) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  useThemeColor: (props: { light?: string; dark?: string }, colorName: string) => string;
}

// Create context
const UIContext = createContext<UIContextType | undefined>(undefined);

// Provider component
export function UIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);
  const systemColorScheme = useRNColorScheme();

  // Sync with system color scheme
  useEffect(() => {
    dispatch({ type: 'SET_COLOR_SCHEME', payload: systemColorScheme });
  }, [systemColorScheme]);

  const setColorScheme = useCallback((scheme: ColorSchemeName) => {
    dispatch({ type: 'SET_COLOR_SCHEME', payload: scheme });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    dispatch({ type: 'SHOW_TOAST', payload: { message, type } });
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      dispatch({ type: 'HIDE_TOAST' });
    }, 3000);
  }, []);

  const hideToast = useCallback(() => {
    dispatch({ type: 'HIDE_TOAST' });
  }, []);

  const useThemeColor = useCallback(
    (props: { light?: string; dark?: string }, colorName: string): string => {
      const theme = state.colorScheme ?? 'light';
      const colorFromProps = props[theme];

      if (colorFromProps) {
        return colorFromProps;
      }

      // Default theme colors
      const Colors = {
        light: {
          text: '#000000',
          background: '#ffffff',
          primary: '#2f95dc',
          secondary: '#f4f4f5',
          tint: '#2f95dc',
          tabIconDefault: '#cccccc',
          tabIconSelected: '#2f95dc',
        },
        dark: {
          text: '#ffffff',
          background: '#000000',
          primary: '#2f95dc',
          secondary: '#27272a',
          tint: '#ffffff',
          tabIconDefault: '#cccccc',
          tabIconSelected: '#ffffff',
        },
      };

      return Colors[theme][colorName as keyof typeof Colors.light];
    },
    [state.colorScheme]
  );

  const value = {
    ...state,
    setColorScheme,
    setLoading,
    showToast,
    hideToast,
    useThemeColor,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// Hook for using the context
export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
} 