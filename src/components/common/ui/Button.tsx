import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  children,
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
      danger: styles.danger,
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
      danger: styles.dangerText,
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
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  secondary: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#4CAF50',
  },
  danger: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 32,
  },
  medium: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  large: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
  dangerText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#666666',
  },
  loadingContainer: {
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 