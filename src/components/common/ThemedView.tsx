import {
  View,
  type ViewProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
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
    | "centered";
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
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  type = "default",
  colorType = "default",
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const { colors } = useTheme();

  const getTypeStyle = (): StyleProp<ViewStyle> => {
    switch (type) {
      case "card":
        return styles.card;
      case "section":
        return styles.section;
      case "surface":
        return styles.surface;
      case "rounded":
        return styles.rounded;
      case "elevated":
        return styles.elevated;
      case "bordered":
        return styles.bordered;
      case "centered":
        return styles.centered;
      default:
        return styles.default;
    }
  };

  const getColorStyle = (): StyleProp<ViewStyle> => {
    if (lightColor || darkColor) {
      // Custom override
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

  const typeStyle = getTypeStyle();
  const colorStyle = getColorStyle();

  return <View style={[colorStyle, typeStyle, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  default: {
    padding: 0,
    margin: 0,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
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
    backgroundColor: "#f5f5f5",
  },
  surface: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  rounded: {
    borderRadius: 24,
    padding: 16,
  },
  elevated: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    backgroundColor: "#fff",
  },
  bordered: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});
