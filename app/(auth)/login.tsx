import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, Text, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { Button } from '@components/common/ui/Button';
import { AntDesign } from '@expo/vector-icons';
import { GoogleIcon } from '@components/common/icons/GoogleIcon';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@components/common/ui/LoadingSpinner';

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
            <Text style={styles.logo}>
              PicklePass
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>
            Welcome to PicklePass
          </Text>
          <Text style={styles.subtitle}>
            Sign in or create an account to get started
          </Text>

          {/* Buttons Container */}
          <View style={styles.buttonContainer}>
            {/* Email Button */}
            <Button
              variant="primary"
              size="lg"
              onPress={() => router.push('/(auth)/email-login')}
            >
              Sign in with Email
            </Button>

            {/* Register Button */}
            <Button
              variant="secondary"
              size="lg"
              onPress={() => router.push('/(auth)/register')}
            >
              Create New Account
            </Button>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Buttons */}
            <Button
              variant="secondary"
              size="lg"
              disabled={true}
              onPress={() => {}}
            >
              <View style={styles.socialButtonContent}>
                <View style={styles.iconContainer}>
                  <GoogleIcon size={20} />
                </View>
                <Text style={[styles.socialButtonText, styles.disabledText]}>Google Sign-In (Coming Soon)</Text>
              </View>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              disabled={true}
              onPress={() => {}}
            >
              <View style={styles.socialButtonContent}>
                <View style={styles.iconContainer}>
                  <AntDesign name="facebook-square" size={20} color="#1877F2" />
                </View>
                <Text style={[styles.socialButtonText, styles.disabledText]}>Facebook Sign-In (Coming Soon)</Text>
              </View>
            </Button>
          </View>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInLink} onPress={() => router.push('/(auth)/email-login')}>
                Sign in
              </Text>
            </Text>
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
    color: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
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
    color: '#6B7280',
    fontSize: 14,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  disabledText: {
    color: '#6B7280',
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