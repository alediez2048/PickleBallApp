import {
  View,
  type ViewProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  Platform,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export type ThemedViewProps = ViewProps & {
  type?:
    | "default"
    | "card"
    | "section"
    | "surface"
    | "rounded"
    | "elevated"
    | "bordered"
    | "centered"
    | "dateSection"
    | "dateTitleContainer"
    | "gameCard"
    | "gameFooter"
    | "badgeContainer"
    | "modalContentCustom"
    | "emptyStateContainer";
  colorType?:
    | "default"
    | "primary"
    | "secondary"
    | "background"
    | "tint"
    | "tabIconDefault"
    | "tabIconSelected"
    | "white"
    | "black";
  borderColorType?:
    | "default"
    | "primary"
    | "secondary"
    | "background"
    | "tint"
    | "tabIconDefault"
    | "tabIconSelected"
    | "white"
    | "black";
  lightColor?: string;
  darkColor?: string;
};

const styles = StyleSheet.create({
  default: {
    padding: 0,
    margin: 0,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
  },
  surface: {
    borderRadius: 8,
    padding: 12,
  },
  rounded: {
    borderRadius: 24,
    padding: 16,
  },
  elevated: {
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  bordered: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  dateSection: {
    marginBottom: 16,
  },
  dateTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gameCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  gameFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    paddingTop: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalContentCustom: {
    borderRadius: 24,
    width: "85%",
    padding: 24,
    alignItems: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
    padding: 32,
    borderRadius: 12,
    marginTop: 16,
  },
});

// ThemedView always uses themed styles, no raw View
function getTypeStyle(
  type: ThemedViewProps["type"],
  colors: any
): StyleProp<ViewStyle> {
  switch (type) {
    case "card":
    case "elevated":
    case "dateTitleContainer":
      return { shadowColor: colors.black };
    case "gameCard":
      return { shadowColor: Platform.OS === "ios" ? colors.black : undefined };
    default:
      return {};
  }
}

export function ThemedView({
  style,
  type = "default",
  colorType = "default",
  borderColorType = "default",
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const { colors } = useTheme();

  // Always use palette for background
  const getColorStyle = (): StyleProp<ViewStyle> => {
    if (lightColor || darkColor) {
      return { backgroundColor: lightColor || darkColor };
    }
    switch (colorType) {
      case "primary":
        return { backgroundColor: colors.primary };
      case "secondary":
        return { backgroundColor: colors.secondary };
      case "background":
        return { backgroundColor: colors.background };
      case "tint":
        return { backgroundColor: colors.tint };
      case "tabIconDefault":
        return { backgroundColor: colors.tabIconDefault };
      case "tabIconSelected":
        return { backgroundColor: colors.tabIconSelected };
      case "white":
        return { backgroundColor: colors.white };
      case "black":
        return { backgroundColor: colors.black };
      default:
        return { backgroundColor: colors.background };
    }
  };

  // Always use palette for border
  const getBorderColorStyle = (): StyleProp<ViewStyle> => {
    switch (borderColorType) {
      case "primary":
        return { borderColor: colors.primary };
      case "secondary":
        return { borderColor: colors.secondary };
      case "background":
        return { borderColor: colors.background };
      case "tint":
        return { borderColor: colors.tint };
      case "tabIconDefault":
        return { borderColor: colors.tabIconDefault };
      case "tabIconSelected":
        return { borderColor: colors.tabIconSelected };
      case "white":
        return { borderColor: colors.white };
      case "black":
        return { borderColor: colors.black };
      default:
        return {};
    }
  };

  // Compose themed styles only
  const typeStyle = styles[type || "default"] || styles.default;
  const dynamicTypeStyle = getTypeStyle(type, colors);
  const colorStyle = getColorStyle();
  const borderColorStyle = getBorderColorStyle();

  return (
    <View
      style={[colorStyle, typeStyle, dynamicTypeStyle, borderColorStyle, style]}
      {...otherProps}
    />
  );
}
