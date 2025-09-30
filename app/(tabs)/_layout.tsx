import { Tabs, TabList, TabSlot, TabTrigger } from "expo-router/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { IconSymbol } from "@/components/common/IconSymbol";
import { StyleProp, TextStyle } from "react-native";
import { ThemedView } from "@/components/common/ThemedView";
import { ThemedText } from "@/components/common/ThemedText";
import { ActivityIndicator } from "react-native";
import { useCurrentRouteName } from "@/hooks/useCurrentRouteName";
import { StyleSheet } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { ADMIN_USERS } from "@constants/admin";

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

type TabItem = {
  name: string;
  label: string;
  icon: IconName;
  route: Href;
  adminOnly?: boolean;
};

const TAB_ITEMS: TabItem[] = [
  {
    name: "index",
    label: "Home",
    icon: "house.fill" as const,
    route: "/",
  },
  {
    name: "explore",
    label: "Explore",
    icon: "gamecontroller.fill" as const,
    route: "/explore",
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person.fill" as const,
    route: "/profile",
  },
  {
    name: "admin",
    label: "Admin",
    icon: "gearshape.fill" as const,
    route: "/admin",
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
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText className="mt-4 text-lg text-gray-500">
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
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText className="mt-4 text-lg text-gray-500">
          Checking skill level...
        </ThemedText>
      </ThemedView>
    );
  }

  const isAdmin = ADMIN_USERS.includes(user?.email ?? "");
  const visibleTabs = TAB_ITEMS.filter((tab) => !tab.adminOnly || isAdmin);

  return (
    <Tabs>
      <TabSlot />
      <TabList style={[styles.tabList, { borderTopColor: colors.border }]}>
        {visibleTabs.map((tab) => {
          const isFocused = currentRoute === tab.name;
          const tint = isFocused ? colors.primary : colors.text;
          return (
            <TabTrigger
              key={tab.name}
              name={tab.name}
              href={tab.route}
              style={styles.tabTrigger}
            >
              <ThemedView style={styles.tabItem}>
                <IconSymbol name={tab.icon} size={24} color={tint} />
                <ThemedText style={{ color: tint, marginTop: 4 }}>
                  {tab.label}
                </ThemedText>
              </ThemedView>
            </TabTrigger>
          );
        })}
      </TabList>
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
  tabList: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    padding: 0,
    borderTopWidth: 1,
    marginTop: 2,
  },
  tabTrigger: {
    flex: 1,
  },
  tabItem: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
});
