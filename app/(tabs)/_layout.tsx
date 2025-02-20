import { Tabs } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { TabBarBackground } from '@/components/common/navigation/TabBarBackground';
import { IconSymbol } from '@/components/ui/IconSymbol';

const TAB_ITEMS = [
  {
    name: 'index',
    label: 'Home',
    icon: 'house.fill' as const,
  },
  {
    name: 'explore',
    label: 'Explore',
    icon: 'gamecontroller.fill' as const,
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: 'person.fill' as const,
  },
];

export default function TabLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.emailVerified) {
      router.replace('/verify-email' as const);
      return;
    }

    if (!user?.skillLevel) {
      router.replace('/(skill-select)' as const);
      return;
    }
  }, [user?.emailVerified, user?.skillLevel]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666666',
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 85,
          paddingTop: 8,
          paddingBottom: 32,
        },
        tabBarItemStyle: {
          backgroundColor: '#FFFFFF',
        },
      }}>
      {TAB_ITEMS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                name={tab.icon}
                size={24}
                color={color}
                style={{ opacity: focused ? 1 : 0.8 }}
              />
            ),
            tabBarLabel: tab.label,
          }}
        />
      ))}
    </Tabs>
  );
}
