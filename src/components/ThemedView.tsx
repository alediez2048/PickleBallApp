import React from 'react';
import { View, ViewProps } from 'react-native';
import { useColorScheme } from '@hooks/useColorScheme';

export function ThemedView(props: ViewProps) {
  const colorScheme = useColorScheme();
  const { style, ...otherProps } = props;

  return (
    <View
      className={`bg-white dark:bg-gray-900 ${props.className || ''}`}
      {...otherProps}
    />
  );
} 