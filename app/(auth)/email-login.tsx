import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@components/ThemedText';
import { Button } from '@components/common/ui/Button';
import { LoadingSpinner } from '@components/common/ui/LoadingSpinner';
import { validateLoginForm } from '@/utils/validation';

export default function EmailLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

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
    <View className="flex-1 bg-white dark:bg-gray-900">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6">
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-12 left-6 z-10"
          >
            <ThemedText className="text-gray-600 dark:text-gray-400">← Back</ThemedText>
          </TouchableOpacity>

          <View className="flex-1 justify-center -mt-20">
            {/* Title */}
            <View className="mb-8">
              <ThemedText className="text-2xl font-bold text-black dark:text-white mb-2">
                Sign in with email
              </ThemedText>
              <ThemedText className="text-base text-gray-600 dark:text-gray-400">
                Enter your email and password
              </ThemedText>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <View>
                <TextInput
                  className="h-[52px] px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white text-base"
                  placeholder="Email"
                  placeholderTextColor={Platform.select({ ios: '#6B7280', android: '#9CA3AF' })}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                  returnKeyType="next"
                />
                {errors.email && (
                  <ThemedText className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                    {errors.email}
                  </ThemedText>
                )}
              </View>

              <View>
                <TextInput
                  className="h-[52px] px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white text-base"
                  placeholder="Password"
                  placeholderTextColor={Platform.select({ ios: '#6B7280', android: '#9CA3AF' })}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                {errors.password && (
                  <ThemedText className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                    {errors.password}
                  </ThemedText>
                )}
              </View>

              {errors.form && (
                <ThemedText className="text-red-500 dark:text-red-400 text-sm text-center">
                  {errors.form}
                </ThemedText>
              )}

              <Button 
                onPress={handleLogin}
                size="lg"
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