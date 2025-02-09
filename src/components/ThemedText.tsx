import React from 'react';
import { Text, TextProps } from 'react-native';

export function ThemedText(props: TextProps) {
  const { style, ...otherProps } = props;

  return (
    <Text
      style={[
        { 
          color: '#000000',
        },
        style
      ]}
      {...otherProps}
    />
  );
} 