import { useColorScheme } from 'react-native';

export interface ThemedStyle<T> {
  light: T;
  dark: T;
}

export function useThemedStyle<T>(style: ThemedStyle<T>): T {
  const colorScheme = useColorScheme();
  return style[colorScheme === 'dark' ? 'dark' : 'light'];
} 