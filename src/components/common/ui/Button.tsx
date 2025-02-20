import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';

// Define valid size mappings
const SIZE_MAPPINGS = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
};

export interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large' | 'sm' | 'md' | 'lg';  // Updated to include shorthand
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

  // Normalize size prop
  const normalizedSize = SIZE_MAPPINGS[size as keyof typeof SIZE_MAPPINGS] || size;

  console.log('Button Size Normalization:', {
    componentId: accessibilityLabel || children,
    originalSize: size,
    normalizedSize,
    hasValidSize: normalizedSize in styles,
  });

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

    const selectedSizeStyle = sizeStyles[normalizedSize as keyof typeof sizeStyles];

    console.log('Button Style Resolution:', {
      componentId: accessibilityLabel || children,
      variant,
      normalizedSize,
      hasValidVariantStyle: variant in variantStyles,
      hasValidSizeStyle: !!selectedSizeStyle,
      customStyleType: style ? typeof style : 'none',
    });

    const computedStyles = [
      styles.base,
      variantStyles[variant],
      selectedSizeStyle,
      fullWidth && styles.fullWidth,
      isDisabled && styles.disabled,
      style,
    ];

    return computedStyles;
  };

  const getTextStyle = () => {
    const variantTextStyles = {
      primary: styles.primaryText,
      secondary: styles.secondaryText,
      outline: styles.outlineText,
      danger: styles.dangerText,
    };

    const textStyles = [
      styles.text,
      variantTextStyles[variant],
      isDisabled && styles.disabledText,
    ];

    console.log('Button Text Style:', {
      componentId: accessibilityLabel || children,
      variant,
      isDisabled,
      textStyles,
    });

    return textStyles;
  };

  console.log('Button Render:', {
    componentId: accessibilityLabel || children,
    props: {
      variant,
      size,
      loading,
      disabled,
      fullWidth,
      hasCustomStyle: !!style,
      hasOnPress: !!onPress,
    },
  });

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