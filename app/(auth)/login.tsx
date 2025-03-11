import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { Button } from '@/components/common/ui/Button';
import { AntDesign } from '@expo/vector-icons';
import { GoogleIcon } from '@/components/common/icons/GoogleIcon';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { ThemedText } from '@/components/ThemedText';

export default function LoginScreen() {
  const { signInWithGoogle, signInWithFacebook } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'facebook':
          await signInWithFacebook();
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Signing in..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <ThemedText variant="title" style={styles.logo}>
              PicklePass
            </ThemedText>
          </View>

          {/* Title */}
          <ThemedText variant="title" style={styles.title}>
            Welcome to PicklePass
          </ThemedText>
          <ThemedText variant="subtitle" style={styles.subtitle}>
            Sign in or create an account to get started
          </ThemedText>

          {/* Buttons Container */}
          <View style={styles.buttonContainer}>
            {/* Email Login Button */}
            <Button
              variant="primary"
              onPress={() => router.push('/email-login')}
              style={styles.emailButton}
            >
              <ThemedText variant="body" style={styles.buttonText}>
                Continue with Email
              </ThemedText>
            </Button>

            {/* Register Button */}
            <Button
              variant="outline"
              size="large"
              fullWidth
              onPress={() => router.push('/(auth)/register')}
            >
              Create New Account
            </Button>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <ThemedText variant="caption" style={styles.dividerText}>or</ThemedText>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <TouchableOpacity 
              style={[styles.socialButton, styles.socialButtonWithBorder]} 
              disabled={true}
              activeOpacity={0.8}
              onPress={() => handleSocialSignIn('google')}
            >
              <View style={styles.socialButtonContent}>
                <View style={styles.socialIconContainer}>
                  <GoogleIcon size={20} />
                </View>
                <ThemedText style={styles.socialButtonText}>Continue with Google</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.socialButtonWithBorder]} 
              disabled={true}
              activeOpacity={0.8}
              onPress={() => handleSocialSignIn('facebook')}
            >
              <View style={styles.socialButtonContent}>
                <View style={styles.socialIconContainer}>
                  <AntDesign name="facebook-square" size={20} color="#1877F2" />
                </View>
                <ThemedText style={styles.socialButtonText}>Continue with Facebook</ThemedText>
              </View>
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <ThemedText variant="caption" style={styles.signInText}>
              Already have an account?{' '}
              <ThemedText 
                variant="caption" 
                style={styles.signInLink} 
                onPress={() => router.push('/(auth)/email-login')}
              >
                Sign in
              </ThemedText>
            </ThemedText>
          </View>
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
  innerContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 24,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
  },
  socialButton: {
    height: 52,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  socialButtonWithBorder: {
    borderWidth: 1,
    borderColor: '#DADCE0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  socialIconContainer: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3c4043',
  },
  signInContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  signInText: {
    color: '#6B7280',
  },
  signInLink: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  emailButton: {
    // Add appropriate styles for the email button
  },
  buttonText: {
    // Add appropriate styles for the button text
  },
}); 