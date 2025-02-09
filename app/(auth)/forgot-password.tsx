import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, SafeAreaView, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@components/common/ui/Button';
import { LoadingSpinner } from '@components/common/ui/LoadingSpinner';
import { validateEmail } from '@/utils/validation';
import { mockApi } from '@/services/mockApi';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!email) {
        setError('Email is required');
        return;
      }

      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      setIsLoading(true);
      await mockApi.requestPasswordReset({ email });
      setSuccess('If an account exists with this email, you will receive password reset instructions shortly');
    } catch (err) {
      setError('Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Sending reset instructions..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.formContainer}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Reset your password</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you instructions to reset your password
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                    setSuccess(null);
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />
                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}
                {success && (
                  <Text style={styles.successText}>{success}</Text>
                )}
              </View>

              <Button 
                onPress={handleResetPassword} 
                size="lg" 
                disabled={isLoading}
              >
                Send Reset Instructions
              </Button>

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>
                  Remember your password?{' '}
                  <Text 
                    style={styles.signInLink} 
                    onPress={() => router.push('/(auth)/email-login')}
                  >
                    Sign in
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 48,
    left: 24,
    zIndex: 10,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -80,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  signInContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  signInText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signInLink: {
    color: '#000',
    fontWeight: '600',
  },
}); 