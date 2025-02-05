import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@components/ThemedText';
import { ThemedView } from '@components/ThemedView';
import { Button } from '@components/common/ui/Button';
import { LoadingSpinner } from '@components/common/ui/LoadingSpinner';
import { validateLoginForm } from '@/utils/validation';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    try {
      // Reset errors
      setErrors({});

      // Validate form
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
      await signIn(email, password);
      router.replace('/(tabs)');
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
    <ThemedView className="flex-1 p-4">
      <View className="flex-1 justify-center">
        <ThemedText className="text-3xl font-sans-bold text-center mb-8">
          Welcome Back
        </ThemedText>

        <View className="space-y-4">
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

          <Button onPress={handleLogin} size="lg" disabled={isLoading}>
            Sign In
          </Button>

          <View className="flex-row justify-center mt-4">
            <ThemedText>Don't have an account? </ThemedText>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <ThemedText className="text-primary font-sans-bold">
                  Sign Up
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ThemedView>
  );
} 