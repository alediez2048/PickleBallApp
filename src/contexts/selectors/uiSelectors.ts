import { useMemo } from 'react';
import { useUI } from '../UIContext';

// Theme selectors
export const useThemeMode = () => {
  const { colorScheme } = useUI();
  return useMemo(() => ({
    isDark: colorScheme === 'dark',
    isLight: colorScheme === 'light',
    current: colorScheme,
  }), [colorScheme]);
};

// Loading state selectors
export const useLoadingState = () => {
  const { isLoading } = useUI();
  return useMemo(() => ({
    isLoading,
    isReady: !isLoading,
  }), [isLoading]);
};

// Toast selectors
export const useToastState = () => {
  const { toast } = useUI();
  return useMemo(() => ({
    ...toast,
    isSuccess: toast.type === 'success',
    isError: toast.type === 'error',
    isInfo: toast.type === 'info',
  }), [toast]);
};

// Theme color selectors
export const useThemedColor = (colorName: string, customLight?: string, customDark?: string) => {
  const { useThemeColor } = useUI();
  return useMemo(() => 
    useThemeColor(
      customLight || customDark ? { light: customLight, dark: customDark } : {},
      colorName
    ),
    [useThemeColor, colorName, customLight, customDark]
  );
}; 