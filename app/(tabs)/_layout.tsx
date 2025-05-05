import { Tabs } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { TabBarBackground } from "@/components/common/navigation/TabBarBackground";
import { IconSymbol } from "@/components/ui/IconSymbol";

const TAB_ITEMS = [
  {
    name: "index",
    label: "Home",
    icon: "house.fill" as const,
  },
  {
    name: "explore",
    label: "Explore",
    icon: "gamecontroller.fill" as const,
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person.fill" as const,
  },
];

export default function TabLayout() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.email_confirmed_at) {
      router.replace("/verify-email" as const);
      return;
    }

    if (!user?.skill_level) {
      router.replace("/(skill-select)" as const);
      return;
    }
  }, [user?.email_confirmed_at, user?.skill_level]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#666666",
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderTopWidth: 0,
          elevation: 0,
          height: 65,
          backgroundColor: "#FFFFFF",
        },
        tabBarItemStyle: {
          backgroundColor: "#FFFFFF",
        },
      }}
    >
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
