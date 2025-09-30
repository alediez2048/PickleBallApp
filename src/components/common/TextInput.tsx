import React, { forwardRef } from "react";
import {
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";

interface TextInputProps extends Omit<RNTextInputProps, "style"> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onEndIconPress?: () => void;
  containerStyle?: any;
  inputStyle?: any;
}

const TextInputComponent = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      onEndIconPress,
      containerStyle,
      inputStyle,
      editable = true,
      accessibilityLabel,
      accessibilityHint,
      ...props
    },
    ref
  ) => {
    const { colors } = useTheme();

    // Determine the help text to show (error takes precedence)
    const helpText = error || helperText;
    const isInvalid = !!error;

    // Combine accessibility hints
    const combinedAccessibilityHint = [accessibilityHint, helpText]
      .filter(Boolean)
      .join(". ");

    return (
      <ThemedView style={[styles.container, containerStyle]}>
        {label && (
          <ThemedText
            style={[
              styles.label,
              { color: isInvalid ? colors.primary : colors.text },
            ]}
            accessibilityRole="text"
          >
            {label}
          </ThemedText>
        )}

        <ThemedView
          style={[
            styles.inputContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {startIcon && (
            <ThemedView style={styles.iconContainer} accessibilityRole="image">
              {startIcon}
            </ThemedView>
          )}

          <RNTextInput
            ref={ref}
            testID="text-input"
            style={[
              styles.input,
              {
                backgroundColor: editable ? colors.soft : colors.background,
                borderColor: isInvalid ? colors.primary : colors.border,
                color: colors.text,
              },
              startIcon && styles.inputWithStartIcon,
              endIcon && styles.inputWithEndIcon,
              !editable && styles.inputDisabled,
              inputStyle,
            ]}
            editable={editable}
            placeholderTextColor={colors.secondary}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityHint={combinedAccessibilityHint || undefined}
            accessibilityState={{
              disabled: !editable,
            }}
            {...props}
          />

          {endIcon &&
            (onEndIconPress ? (
              <TouchableOpacity
                testID="end-icon-button"
                style={styles.iconContainer}
                onPress={onEndIconPress}
                accessibilityRole="button"
                accessibilityLabel="Toggle password visibility"
              >
                {endIcon}
              </TouchableOpacity>
            ) : (
              <ThemedView testID="end-icon" style={styles.iconContainer}>
                {endIcon}
              </ThemedView>
            ))}
        </ThemedView>

        {helpText && (
          <ThemedText
            style={[
              styles.helpText,
              { color: isInvalid ? colors.primary : colors.text },
            ]}
            accessibilityRole="text"
            accessibilityLiveRegion={isInvalid ? "polite" : "none"}
          >
            {helpText}
          </ThemedText>
        )}
      </ThemedView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    ...Platform.select({
      ios: {
        paddingVertical: 12,
      },
      android: {
        paddingVertical: 8,
      },
    }),
  },
  inputWithStartIcon: {
    paddingLeft: 44,
  },
  inputWithEndIcon: {
    paddingRight: 44,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    position: "absolute",
    height: "100%",
    width: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  helpText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

TextInputComponent.displayName = "TextInput";

export const TextInput = TextInputComponent;
