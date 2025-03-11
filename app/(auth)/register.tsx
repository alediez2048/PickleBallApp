import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth as useExistingAuth } from '@/contexts/AuthContext';
import { useAuth as useSupabaseAuth } from '../context/AuthContext';
import { Button } from '@/components/common/ui/Button';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { validateRegisterForm } from '@/utils/validation';
import { ThemedText } from '@/components/ThemedText';
import * as authService from '../services/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const existingAuth = useExistingAuth();
  const supabaseAuth = useSupabaseAuth();

  const handleRegister = async () => {
    try {
      setErrors({});
      const validationResult = validateRegisterForm(email, password, name);
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
      const { error } = await supabaseAuth.signUp(email, password);
      
      if (error) {
        if (error.message.includes('already registered')) {
          setErrors({ email: 'Email is already registered' });
        } else {
          setErrors({ form: error.message });
        }
        return;
      }
      
      // If successful, also update the user profile with their name
      try {
        // Get the current user
        const { user } = await authService.getCurrentUser();
        
        if (user) {
          // Update the user profile with their name
          await authService.upsertProfile({
            id: user.id,
            full_name: name
          });
        }
        
        // Also sign up with the existing auth system
        // This is temporary until we fully migrate to Supabase
        try {
          await existingAuth.signUp(email, password, name);
        } catch (err) {
          // If the existing auth fails, we can still proceed with Supabase auth
          console.warn('Existing auth failed, but Supabase auth succeeded');
        }
        
        // Show success message
        alert('Registration successful! Please check your email to confirm your account.');
        
        // Navigate back to login
        router.push('/(auth)/login');
      } catch (err) {
        console.error('Error updating profile:', err);
        setErrors({ form: 'Registration successful, but failed to update profile.' });
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'Email already registered') {
        setErrors({ email: 'Email is already registered' });
      } else {
        setErrors({ form: 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Creating your account..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
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
              <ThemedText variant="title" style={styles.title}>Create your account</ThemedText>
              <ThemedText variant="subtitle" style={styles.subtitle}>Enter your details below</ThemedText>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#6B7280"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
                {errors.name && (
                  <ThemedText style={styles.errorText}>{errors.name}</ThemedText>
                )}
              </View>

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
                />
                {errors.email && (
                  <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
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
                />
                {errors.password && (
                  <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
                )}
              </View>

              {errors.form && (
                <ThemedText style={[styles.errorText, styles.formError]}>
                  {errors.form}
                </ThemedText>
              )}

              <Button 
                onPress={handleRegister} 
                size="large" 
                variant="primary"
                fullWidth
                disabled={isLoading}
              >
                Create Account
              </Button>

              <View style={styles.signInContainer}>
                <ThemedText variant="caption" style={styles.signInText}>
                  Already have an account?{' '}
                  <ThemedText 
                    variant="caption" 
                    style={styles.signInLink} 
                    onPress={() => router.push('/(auth)/login')}
                  >
                    Sign in
                  </ThemedText>
                </ThemedText>
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
}); 