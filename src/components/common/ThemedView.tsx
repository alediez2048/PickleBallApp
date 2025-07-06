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
    | "none"
    | "blur";
  colorType?:
    | "default"
    | "primary"
    | "secondary"
    | "background"
    | "tint"
    | "white"
    | "black"
    | "text"
    | "main"
    | "active"
    | "soft"
    | "label"
    | "danger"
    | "success"
    | "warning"
    | "info"
    | "neutral"
    | "line"
    | "border"
    | "open"
    | "advanced"
    | "intermediate"
    | "beginner"
    | "all"
    | "none";
  borderColorType?:
    | "default"
    | "primary"
    | "secondary"
    | "background"
    | "tint"
    | "white"
    | "black"
    | "text"
    | "main"
    | "active"
    | "soft"
    | "label"
    | "danger"
    | "success"
    | "warning"
    | "info"
    | "neutral"
    | "line"
    | "border"
    | "open"
    | "advanced"
    | "intermediate"
    | "beginner"
    | "all"
    | "none";
  borderWidth?: number | "thin" | "normal" | "bold";
};

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
  className,
  style,
  type = "default",
  colorType = "background",
  borderColorType = "none",
  borderWidth,
  ...otherProps
}: ThemedViewProps) {
  const { colors } = useTheme();

  const getColorStyle = (): StyleProp<ViewStyle> => {
    if (colorType === "none") return {};

    const colorValue = (colors as Record<string, string>)[colorType];
    return colorValue ? { backgroundColor: colorValue } : {};
  };

  // Always use palette for border
  const getBorderColorStyle = (): StyleProp<ViewStyle> => {
    if (borderColorType === "none") return {};

    const colorValue = (colors as Record<string, string>)[borderColorType];
    return colorValue ? { borderColor: colorValue } : {};
  };

  // Add borderWidth logic
  const getBorderWidthStyle = (): StyleProp<ViewStyle> => {
    if (typeof borderWidth === "number") {
      return { borderWidth };
    }
    switch (borderWidth) {
      case "thin":
        return { borderWidth: 1 };
      case "normal":
        return { borderWidth: 2 };
      case "bold":
        return { borderWidth: 3 };
      default:
        return {};
    }
  };

  // Compose themed styles only
  const typeStyle =
    !type || type === "none"
      ? undefined
      : styles[type as keyof typeof styles] || styles.default;
  const dynamicTypeStyle = getTypeStyle(type, colors);
  const colorStyle = getColorStyle();
  const borderColorStyle = getBorderColorStyle();

  return (
    <View
      className={className}
      style={[
        colorStyle,
        typeStyle,
        borderColorStyle,
        dynamicTypeStyle,
        getBorderWidthStyle(),
        style,
      ]}
      {...otherProps}
    />
  );
}

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
    paddingVertical: 5,
    paddingHorizontal: 16,
    marginVertical: 0,
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
  blur: {
    backgroundColor: "rgba(133, 133, 133, 0.5)",
    backdropFilter: "blur(10px)",
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
  dateSection: {
    marginBottom: 16,
  },
  dateTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 10,
    marginHorizontal: 0,
    marginBottom: 20,
    marginTop: 20,
    borderTopWidth: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gameCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderColor: "black !important",
    borderWidth: 10,
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
});
