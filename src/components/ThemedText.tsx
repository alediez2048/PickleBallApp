import React from 'react';
import { Text, TextProps } from 'react-native';
import { useColorScheme } from '@hooks/useColorScheme';

export function ThemedText(props: TextProps) {
  const colorScheme = useColorScheme();
  const { style, ...otherProps } = props;

  return (
    <Text
      className={`text-black dark:text-white ${props.className || ''}`}
      {...otherProps}
    />
  );
} 