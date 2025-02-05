import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@components/ThemedText';
import { ThemedView } from '@components/ThemedView';
import { Button } from '@components/common/ui/Button';
import { LoadingSpinner } from '@components/common/ui/LoadingSpinner';
import { validateRegisterForm } from '@/utils/validation';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    try {
      // Reset errors
      setErrors({});

      // Validate form
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
      await signUp(email, password, name);
      router.replace('/(tabs)');
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
    <ThemedView className="flex-1 p-4">
      <View className="flex-1 justify-center">
        <ThemedText className="text-3xl font-sans-bold text-center mb-8">
          Create Account
        </ThemedText>

        <View className="space-y-4">
          <View>
            <TextInput
              className="bg-white dark:bg-gray-800 p-4 rounded-lg text-black dark:text-white"
              placeholder="Full Name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!isLoading}
            />
            {errors.name && (
              <ThemedText className="text-red-500 text-sm mt-1 ml-1">
                {errors.name}
              </ThemedText>
            )}
          </View>

          <View>
            <TextInput
              className="bg-white dark:bg-gray-800 p-4 rounded-lg text-black dark:text-white"
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            {errors.email && (
              <ThemedText className="text-red-500 text-sm mt-1 ml-1">
                {errors.email}
              </ThemedText>
            )}
          </View>

          <View>
            <TextInput
              className="bg-white dark:bg-gray-800 p-4 rounded-lg text-black dark:text-white"
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
            {errors.password && (
              <ThemedText className="text-red-500 text-sm mt-1 ml-1">
                {errors.password}
              </ThemedText>
            )}
          </View>

          {errors.form && (
            <ThemedText className="text-red-500 text-center">
              {errors.form}
            </ThemedText>
          )}

          <Button onPress={handleRegister} size="lg" disabled={isLoading}>
            Sign Up
          </Button>

          <View className="flex-row justify-center mt-4">
            <ThemedText>Already have an account? </ThemedText>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <ThemedText className="text-primary font-sans-bold">
                  Sign In
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ThemedView>
  );
} 