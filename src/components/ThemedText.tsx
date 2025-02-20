import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface ThemedTextProps extends TextProps {
  variant?: 'body' | 'title' | 'subtitle' | 'caption';
  color?: string;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  style,
  variant = 'body',
  color = '#000000',
  ...props
}) => {
  return (
    <Text
      style={[
        { color },
        styles[variant],
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '500',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
}); 