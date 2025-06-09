import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacityProps,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/common/ThemedText";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
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

    const computedStyles = [
      styles.base,
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && styles.fullWidth,
      isDisabled && styles.disabled,
      style,
    ];

    // Debug logging
    console.debug("[Button Render]", {
      text: typeof children === "string" ? children : "Custom children",
      variant,
      size,
      isDisabled,
      fullWidth,
      customStyle: style,
      computedStyles: computedStyles
        .filter(
          (s): s is NonNullable<typeof s> => s !== null && s !== undefined
        )
        .map((s) => (typeof s === "object" ? Object.keys(s) : [])),
    });

    return computedStyles;
  };

  const getTextStyle = () => {
    const variantTextStyles = {
      primary: styles.primaryText,
      secondary: styles.secondaryText,
      outline: styles.outlineText,
      danger: styles.dangerText,
    };

    const computedTextStyles = [
      styles.text,
      variantTextStyles[variant],
      isDisabled && styles.disabledText,
    ];

    return computedTextStyles;
  };

  const buttonLabel =
    typeof children === "string" ? children : accessibilityLabel;

  return (
    <TouchableOpacity
      testID='button'
      style={getButtonStyle()}
      disabled={isDisabled}
      onPress={onPress}
      accessibilityRole='button'
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
            testID='loading-spinner'
            color={variant === "outline" ? "#4CAF50" : "#FFFFFF"}
            accessibilityLabel='Loading'
          />
        </View>
      ) : typeof children === "string" ? (
        <ThemedText style={getTextStyle()}>{children}</ThemedText>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "transparent",
  },
  primary: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  secondary: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: "#4CAF50",
  },
  danger: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    minHeight: 36,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    minHeight: 44,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    minHeight: 52,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: "#E0E0E0",
    borderColor: "#E0E0E0",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#FFFFFF",
  },
  outlineText: {
    color: "#4CAF50",
  },
  dangerText: {
    color: "#FFFFFF",
  },
  disabledText: {
    color: "#666666",
  },
  loadingContainer: {
    minHeight: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
