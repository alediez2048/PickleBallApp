import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, StyleSheet } from 'react-native';
import { LoadingSpinner } from '@components/common/ui/LoadingSpinner';

export default function AuthLayout() {
  const { isLoading } = useAuth();

  // Show a loading screen while checking authentication status
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 