import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../common/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export const HomeScreen: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900 p-4">
      <Text className="text-2xl font-sans-bold text-primary mb-4">
        Welcome to PicklePass
      </Text>
      <Text className="text-base font-sans text-gray-600 dark:text-gray-300 text-center px-4 mb-8">
        Find and join pickleball games near you
      </Text>
      
      <View className="w-full space-y-4">
        <Button onPress={() => console.log('Primary pressed')} size="lg">
          Find Games
        </Button>
        
        <Button 
          variant="secondary" 
          onPress={() => console.log('Secondary pressed')}
          size="md"
        >
          Create Game
        </Button>

        <Button 
          variant="secondary" 
          onPress={signOut}
          size="md"
        >
          Sign Out
        </Button>
      </View>
    </View>
  );
}; 