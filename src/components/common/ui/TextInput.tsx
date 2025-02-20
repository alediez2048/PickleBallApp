import React, { forwardRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { withMemo } from '@/components/hoc/withMemo';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
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
    // Determine the help text to show (error takes precedence)
    const helpText = error || helperText;
    const isInvalid = !!error;

    // Combine accessibility hints
    const combinedAccessibilityHint = [
      accessibilityHint,
      helpText
    ].filter(Boolean).join('. ');

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text
            style={[styles.label, isInvalid && styles.errorLabel]}
            accessibilityRole="text"
          >
            {label}
          </Text>
        )}

        <View style={styles.inputContainer}>
          {startIcon && (
            <View style={styles.iconContainer} accessibilityRole="image">
              {startIcon}
            </View>
          )}

          <RNTextInput
            ref={ref}
            testID="text-input"
            style={[
              styles.input,
              startIcon && styles.inputWithStartIcon,
              endIcon && styles.inputWithEndIcon,
              isInvalid && styles.inputError,
              !editable && styles.inputDisabled,
              inputStyle,
            ]}
            editable={editable}
            placeholderTextColor="#9CA3AF"
            accessibilityLabel={accessibilityLabel || label}
            accessibilityHint={combinedAccessibilityHint || undefined}
            accessibilityState={{
              disabled: !editable,
            }}
            {...props}
          />

          {endIcon && (
            onEndIconPress ? (
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
              <View testID="end-icon" style={styles.iconContainer}>
                {endIcon}
              </View>
            )
          )}
        </View>

        {helpText && (
          <Text
            style={[styles.helpText, isInvalid && styles.errorText]}
            accessibilityRole="text"
            accessibilityLiveRegion={isInvalid ? 'polite' : 'none'}
          >
            {helpText}
          </Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  errorLabel: {
    color: '#DC2626',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#000',
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
  inputError: {
    borderColor: '#DC2626',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    position: 'absolute',
    height: '100%',
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    color: '#DC2626',
  },
});

TextInputComponent.displayName = 'TextInput';

export const TextInput = withMemo(TextInputComponent); 