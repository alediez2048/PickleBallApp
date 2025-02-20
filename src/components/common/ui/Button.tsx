import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';

export interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    const variantStyles = {
      primary: styles.primary,
      secondary: styles.secondary,
      outline: styles.outline,
    };

    const sizeStyles = {
      small: styles.small,
      medium: styles.medium,
      large: styles.large,
    };

    return [
      styles.base,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && styles.fullWidth,
      isDisabled && styles.disabled,
      style,
    ];
  };

  const getTextStyle = () => {
    const variantTextStyles = {
      primary: styles.primaryText,
      secondary: styles.secondaryText,
      outline: styles.outlineText,
    };

    return [
      styles.text,
      variantTextStyles[variant],
      isDisabled && styles.disabledText,
    ];
  };

  const buttonLabel = typeof children === 'string' ? children : accessibilityLabel;

  return (
    <TouchableOpacity
      testID="button"
      style={getButtonStyle()}
      disabled={isDisabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={buttonLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabled,
        busy: loading,
      }}
      {...props}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            testID="loading-spinner"
            color={variant === 'outline' ? '#4CAF50' : '#FFFFFF'}
            accessibilityLabel="Loading"
          />
        </View>
      ) : typeof children === 'string' ? (
        <ThemedText style={getTextStyle()}>{children}</ThemedText>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: '#4CAF50',
  },
  secondary: {
    backgroundColor: '#2196F3',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#4CAF50',
  },
  disabledText: {
    color: '#999999',
  },
  loadingContainer: {
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 