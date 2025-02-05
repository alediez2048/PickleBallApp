import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View } from 'react-native';
import { LoadingSpinner } from '@components/common/ui/LoadingSpinner';

export default function AuthLayout() {
  const { isLoading } = useAuth();

  // Show a loading screen while checking authentication status
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
    </View>
  );
} 