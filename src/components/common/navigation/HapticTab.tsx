import React from 'react';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

export const HapticTab = ({ children, onPress, ...props }: BottomTabBarButtonProps) => {
  const handlePress = React.useCallback((e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  }, [onPress]);

  return (
    <Pressable
      {...props}
      className="flex-1 items-center justify-center"
      onPress={handlePress}
    >
      {children}
    </Pressable>
  );
}; 