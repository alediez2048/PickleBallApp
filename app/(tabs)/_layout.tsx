import { Tabs } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { IconSymbol } from "@/components/common/IconSymbol";
import { StyleProp, TextStyle } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { ActivityIndicator } from "react-native";
import { useCurrentRouteName } from "@/hooks/useCurrentRouteName";
import { StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

type IconName =
  | "house.fill"
  | "gamecontroller.fill"
  | "person.fill"
  | "gearshape.fill";

interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

const ADMIN_USERS = ["urbina.yoimar@gmail.com"];

const TAB_ITEMS = [
  {
    name: "index",
    label: "Home",
    icon: "house.fill" as const,
    route: "index",
  },
  {
    name: "explore",
    label: "Explore",
    icon: "gamecontroller.fill" as const,
    route: "explore",
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person.fill" as const,
    route: "profile",
  },
  {
    name: "admin",
    label: "Admin",
    icon: "gearshape.fill" as const,
    route: "admin",
    adminOnly: true,
  },
];

export default function TabLayout() {
  const { user } = useAuth();
  const router = useRouter();
  const currentRoute = useCurrentRouteName();
  const { colors } = useTheme();

  useEffect(() => {
    if (
      user &&
      typeof user.email_confirmed_at !== "undefined" &&
      !user.email_confirmed_at
    ) {
      if (currentRoute !== "verify-email") {
        router.replace("/verify-email");
      }
    }
  }, [user?.email_confirmed_at, currentRoute]);

  if (!user || typeof user.email_confirmed_at === "undefined") {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ActivityIndicator size='large' color='#4CAF50' />
        <ThemedText className='mt-4 text-lg text-gray-500'>
          Loading...
        </ThemedText>
      </ThemedView>
    );
  }
  if (!user.email_confirmed_at) {
    return null;
  }
  if (!user.skill_level) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ActivityIndicator size='large' color='#4CAF50' />
        <ThemedText className='mt-4 text-lg text-gray-500'>
          Checking skill level...
        </ThemedText>
      </ThemedView>
    );
  }

  const isAdmin = ADMIN_USERS.includes(user?.email ?? "");
  const visibleTabs = TAB_ITEMS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -45,
          borderTopWidth: 1,
          elevation: 0,
          height: 100,
          margin: 0,
          padding: 0,
          zIndex: 1,
          backgroundColor: colors.background,
        },
      }}
    >
      {visibleTabs.map((tab) => (
        <Tabs.Screen
          key={tab.route}
          name={tab.name}
          options={{
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                name={tab.icon}
                size={28}
                color={color}
                style={{
                  opacity: focused ? 1 : 0.8,
                  padding: 0,
                  margin: 0,
                }}
              />
            ),
            tabBarLabel: tab.label,
            tabBarLabelStyle: {
              fontSize: 12,
              padding: 0,
              margin: 0,
            }, // Style for the tab label
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
