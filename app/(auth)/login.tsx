import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@components/ThemedText';
import { ThemedView } from '@components/ThemedView';
import { Button } from '@components/common/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async () => {
    try {
      setError('');
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <ThemedView className="flex-1 p-4">
      <View className="flex-1 justify-center">
        <ThemedText className="text-3xl font-sans-bold text-center mb-8">
          Welcome Back
        </ThemedText>

        <View className="space-y-4">
          <TextInput
            className="bg-white dark:bg-gray-800 p-4 rounded-lg text-black dark:text-white"
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            className="bg-white dark:bg-gray-800 p-4 rounded-lg text-black dark:text-white"
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <ThemedText className="text-red-500 text-center">
              {error}
            </ThemedText>
          ) : null}

          <Button onPress={handleLogin} size="lg">
            Sign In
          </Button>

          <View className="flex-row justify-center mt-4">
            <ThemedText>Don't have an account? </ThemedText>
            <Link href="/register" asChild>
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