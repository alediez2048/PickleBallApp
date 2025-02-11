import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, View, StyleSheet } from 'react-native';
import { withMemo } from '@/components/hoc/withMemo';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const ButtonComponent: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  loading,
  style,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const buttonStyles = [
    styles.button,
    styles[`${size}Button`],
    variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    variant === 'primary' ? styles.primaryText : styles.secondaryText,
    disabled && styles.disabledText,
  ];

  // Determine the button's label for screen readers
  const buttonLabel = accessibilityLabel || (typeof children === 'string' ? children : undefined);

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={buttonLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      {...props}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            color={variant === 'primary' ? '#fff' : '#000'} 
            accessibilityLabel="Loading"
          />
        </View>
      ) : (
        typeof children === 'string' ? (
          <Text 
            style={textStyles}
            numberOfLines={1}
            accessibilityRole="text"
          >
            {children}
          </Text>
        ) : (
          children
        )
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  smButton: {
    height: 32,
    paddingHorizontal: 12,
  },
  mdButton: {
    height: 40,
    paddingHorizontal: 16,
  },
  lgButton: {
    height: 48,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#000',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#000',
  },
  disabledText: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const Button = withMemo(ButtonComponent); 