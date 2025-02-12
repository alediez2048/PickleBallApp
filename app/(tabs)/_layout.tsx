import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, Text } from 'react-native';
import { HapticTab } from '../../src/components/common/navigation/HapticTab';
import { TabBarBackground } from '../../src/components/common/navigation/TabBarBackground';
import { IconSymbol } from '@/components/ui/IconSymbol';

const TAB_ITEMS = [
  {
    name: 'index',
    title: 'Home',
    icon: ({ color }: { color: string }) => <IconSymbol name="house.fill" color={color} size={24} />,
  },
  {
    name: 'explore',
    title: 'Explore',
    icon: ({ color }: { color: string }) => (
      <Text style={{ color, fontSize: 24 }}>🔍</Text>
    ),
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: ({ color }: { color: string }) => <IconSymbol name="person.fill" color={color} size={24} />,
  },
] as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => <TabBarBackground />,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      {TAB_ITEMS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => tab.icon({ color }),
            tabBarButton: (props) => <HapticTab {...props} />,
          }}
        />
      ))}
    </Tabs>
  );
}
