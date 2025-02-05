import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';
import { HapticTab } from '../../src/components/common/navigation/HapticTab';
import { TabBarBackground } from '../../src/components/common/navigation/TabBarBackground';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: props => <HapticTab {...props} />,
        tabBarBackground: () => <TabBarBackground />,
        tabBarActiveTintColor: '#2E7D32', // primary color
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 24 }}>🔍</Text>
          ),
        }}
      />
    </Tabs>
  );
}
