import React, { useState } from 'react';
import { View, SafeAreaView, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@components/common/ui/Button';
import { LoadingSpinner } from '@components/common/ui/LoadingSpinner';
import { mockApi } from '@/services/mockApi';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmailScreen() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      await mockApi.resendVerificationEmail(user.email);
      setSuccess('Verification email has been resent. Please check your inbox.');
    } catch (err) {
      if (err instanceof Error && err.message === 'Email already verified') {
        router.replace('/(tabs)');
      } else {
        setError('Failed to resend verification email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = async () => {
    try {
      setIsLoading(true);
      await signOut();
      // Navigation will be handled by the root layout
    } catch (err) {
      setError('Failed to sign out. Please try again.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Please wait..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📧</Text>
        </View>

        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification email to{'\n'}
          <Text style={styles.email}>{user?.email}</Text>
        </Text>

        <View style={styles.messageContainer}>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          {success && (
            <Text style={styles.successText}>{success}</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Text style={styles.resendText}>
            Didn't receive the email?
          </Text>
          <Button
            variant="secondary"
            onPress={handleResendVerification}
            disabled={isLoading}
          >
            Resend Verification Email
          </Button>

          <View style={styles.divider} />

          <Text style={styles.signInText}>
            Want to use a different account?
          </Text>
          <Button
            variant="secondary"
            onPress={handleBackToSignIn}
            disabled={isLoading}
          >
            Back to Sign In
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  email: {
    color: '#000',
    fontWeight: '600',
  },
  messageContainer: {
    marginBottom: 24,
    minHeight: 40,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#6B7280',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginVertical: 8,
  },
  signInText: {
    color: '#6B7280',
    fontSize: 14,
  },
}); 