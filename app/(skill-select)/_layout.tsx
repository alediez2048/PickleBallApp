import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View } from 'react-native';
import { LoadingSpinner } from '@/components/common/ui/LoadingSpinner';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function SkillSelectLayout() {
  const { isLoading, user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }
      
      // If user already has a skill level, redirect to main app
      if (user?.skillLevel) {
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, isAuthenticated, user?.skillLevel]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <LoadingSpinner message="Loading..." />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
} 