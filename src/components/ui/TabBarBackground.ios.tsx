import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

export default function BlurTabBarBackground() {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: '#FFFFFF' }
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}
