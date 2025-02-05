import React from 'react';
import { Text, TextProps } from 'react-native';
import { useColorScheme } from '@hooks/useColorScheme';

export function ThemedText(props: TextProps) {
  const colorScheme = useColorScheme();
  const { style, className, ...otherProps } = props;

  return (
    <Text
      style={[
        { color: colorScheme === 'dark' ? '#ffffff' : '#000000' },
        style
      ]}
      className={className}
      {...otherProps}
    />
  );
} 