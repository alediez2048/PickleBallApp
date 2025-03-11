import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth as useExistingAuth } from '@/contexts/AuthContext';
import { useAuth as useSupabaseAuth } from '../context/AuthContext';
import { Button } from '@/components/common/ui/Button';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { validateLoginForm } from '@/utils/validation';
import { ThemedText } from '@/components/ThemedText';

export default function EmailLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const existingAuth = useExistingAuth();
  const supabaseAuth = useSupabaseAuth();

  const handleLogin = async () => {
    try {
      setErrors({});
      const validationResult = validateLoginForm(email, password);
      if (validationResult.hasErrors()) {
        const newErrors: { [key: string]: string } = {};
        validationResult.getAllErrors().forEach(error => {
          newErrors[error.field] = error.message;
        });
        setErrors(newErrors);
        return;
      }

      setIsLoading(true);
      
      // Use Supabase authentication
      const { error } = await supabaseAuth.signIn(email, password);
      
      if (error) {
        setErrors({ form: error.message });
        return;
      }
      
      // If successful, also sign in with the existing auth system
      // This is temporary until we fully migrate to Supabase
      try {
        await existingAuth.signIn(email, password);
      } catch (err) {
        // If the existing auth fails, we can still proceed with Supabase auth
        console.warn('Existing auth failed, but Supabase auth succeeded');
      }
      
      // Navigation will be handled by the root layout
    } catch (err) {
      setErrors({ form: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Signing in..." />;
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ThemedText style={styles.backButtonText}>← Back</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <ThemedText variant="title" style={styles.title}>
                Sign in with email
              </ThemedText>
              <ThemedText variant="subtitle" style={styles.subtitle}>
                Enter your email and password
              </ThemedText>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                  returnKeyType="next"
                />
                {errors.email && (
                  <ThemedText style={styles.errorText}>
                    {errors.email}
                  </ThemedText>
                )}
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                {errors.password && (
                  <ThemedText style={styles.errorText}>
                    {errors.password}
                  </ThemedText>
                )}
                <TouchableOpacity 
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={styles.forgotPasswordContainer}
                >
                  <ThemedText style={styles.forgotPasswordText}>Forgot password?</ThemedText>
                </TouchableOpacity>
              </View>

              {errors.form && (
                <ThemedText style={[styles.errorText, styles.formError]}>
                  {errors.form}
                </ThemedText>
              )}

              <Button 
                onPress={handleLogin}
                size="large"
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                Continue
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
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
  header: {
    height: 60,
    justifyContent: 'center',
    marginTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 20,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280',
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
    borderRadius: 25,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
  },
  formError: {
    textAlign: 'center',
    marginBottom: 16,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
}); 