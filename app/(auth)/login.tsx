import React from 'react';
import { View, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedText } from '@components/ThemedText';
import { Button } from '@components/common/ui/Button';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

export default function LoginScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-center">
          <View className="px-6 items-center">
            {/* Logo */}
            <ThemedText style={{ 
              fontSize: 32, 
              fontWeight: 'bold', 
              textAlign: 'center', 
              color: '#000',
              letterSpacing: -1,
              marginBottom: 32
            }}>
              PicklePass
            </ThemedText>

            {/* Title */}
            <ThemedText style={{ 
              fontSize: 24, 
              fontWeight: '600', 
              textAlign: 'center', 
              color: '#000',
              letterSpacing: -0.5,
              marginBottom: 32
            }}>
              Create an account
            </ThemedText>

            {/* Form */}
            <View className="w-full max-w-[400px]">
              {/* Email Button */}
              <Button
                variant="primary"
                size="lg"
                onPress={() => router.push('/(auth)/email-login')}
                icon={<AntDesign name="mail" size={20} color="white" />}
              >
                Continue with Email
              </Button>

              {/* Divider */}
              <View className="flex-row items-center justify-center my-4">
                <View className="flex-1 h-[1px] bg-gray-200" />
                <ThemedText style={{ 
                  marginHorizontal: 16, 
                  color: '#666', 
                  fontSize: 14
                }}>
                  or
                </ThemedText>
                <View className="flex-1 h-[1px] bg-gray-200" />
              </View>

              {/* Social Buttons */}
              <View className="space-y-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onPress={() => {}}
                  icon={<FontAwesome name="facebook" size={20} color="#1877F2" />}
                >
                  Continue with Facebook
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onPress={() => {}}
                  icon={<AntDesign name="google" size={20} color="#DB4437" />}
                >
                  Continue with Google
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onPress={() => {}}
                  icon={<AntDesign name="apple1" size={20} color="black" />}
                >
                  Continue with Apple
                </Button>
              </View>

              {/* Sign In Link */}
              <View className="flex-row justify-center items-center mt-8">
                <ThemedText style={{ 
                  color: '#666', 
                  fontSize: 14
                }}>
                  Already have an account?{' '}
                </ThemedText>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <ThemedText style={{ 
                      color: '#000', 
                      fontWeight: '600', 
                      fontSize: 14
                    }}>
                      Sign in
                    </ThemedText>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 