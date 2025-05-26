import { Tabs } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { StyleProp, TextStyle } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { ActivityIndicator } from "react-native";
import { useCurrentRouteName } from "@/hooks/useCurrentRouteName";

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

  // Redirect as soon as user.email_confirmed_at is available and not set
  useEffect(() => {
    if (
      user &&
      typeof user.email_confirmed_at !== "undefined" &&
      !user.email_confirmed_at
    ) {
      // Prevent redirect loop if already on /verify-email
      if (currentRoute !== "verify-email") {
        router.replace("/verify-email");
      }
    }
  }, [user?.email_confirmed_at, currentRoute]);

  // Only render tabs if user is validated
  if (!user || typeof user.email_confirmed_at === "undefined") {
    return (
      <ThemedView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size='large' color='#4CAF50' />
        <ThemedText className='mt-4 text-lg text-gray-500'>
          Loading...
        </ThemedText>
      </ThemedView>
    );
  }
  if (!user.email_confirmed_at) {
    // The redirect will happen via useEffect above
    return null;
  }
  if (!user.skill_level) {
    return (
      <ThemedView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator size='large' color='#4CAF50' />
        <ThemedText className='mt-4 text-lg text-gray-500'>
          Checking skill level...
        </ThemedText>
      </ThemedView>
    );
  }

  // Filter by admin users
  const isAdmin = ADMIN_USERS.includes(user?.email ?? "");
  const visibleTabs = TAB_ITEMS.filter((tab) => !tab.adminOnly || isAdmin);

  // ThemedView is used as the main container for consistent theming
  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Example ThemedText header, can be customized or removed */}
      {/* <ThemedText type="title">Main Navigation</ThemedText> */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: "#4CAF50",
          tabBarInactiveTintColor: "#666666",
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderTopWidth: 0,
            elevation: 0,
            height: 65,
            // ThemedView handles background color
          },
          tabBarItemStyle: {
            // ThemedView handles background color
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
    </ThemedView>
  );
}
