import React from 'react';
import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

export const HapticTab: React.FC<BottomTabBarButtonProps> = ({ children, onPress, ...props }) => {
  return (
    <Pressable
      {...props}
      className="flex-1 items-center justify-center"
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
    >
      {children}
    </Pressable>
  );
}; 