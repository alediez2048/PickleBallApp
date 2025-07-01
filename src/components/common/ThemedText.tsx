import {
  Text,
  type TextProps,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  Platform,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import "../../../global.css";

export type ThemedTextProps = TextProps & {
  type?:
    | "title"
    | "midTitle"
    | "subtitle"
    | "miniSubtitle"
    | "caption"
    | "link"
    | "bold"
    | "badge"
    | "text"
    | "label"
    | "value";
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
  align?: "left" | "center" | "right" | "justify";
  weight?: number | "normal" | "bold";
  size?: number; // 1-15, see below
  className?: string; // Tailwind or global classes
};

const fontSizeMap: Record<number, number> = {
  1: 12,
  2: 14,
  3: 16,
  4: 18,
  5: 20,
  6: 22,
  7: 24,
  8: 26,
  9: 28,
  10: 30,
  11: 32,
  12: 34,
  13: 36,
  14: 38,
  15: 40,
};

export function ThemedText({
  style,
  type = "text",
  colorType = "text",
  weight = "normal",
  size = 3,
  align,
  className,
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme();

  // Compose style based on type
  const getTypeStyle = (): StyleProp<TextStyle> => {
    switch (type) {
      case "title":
        return styles.title;
      case "midTitle":
        return styles.midTitle;
      case "subtitle":
        return styles.subtitle;
      case "miniSubtitle":
        return styles.miniSubtitle;
      case "caption":
        return styles.caption;
      case "link":
        return styles.link;
      case "bold":
        return styles.bold;
      case "badge":
        return styles.badge;
      case "label":
        return styles.label;
      case "value":
        return styles.value;
      case "text":
      default:
        return {};
    }
  };

  // Compose color style
  const getColorStyle = (): StyleProp<TextStyle> => {
    if (colorType === "none") return {};
    const colorValue = (colors as Record<string, string>)[colorType];
    return colorValue ? { color: colorValue } : {};
  };

  // Compose fontWeight style
  const getWeightStyle = (): StyleProp<TextStyle> => {
    if (typeof weight === "number") {
      return { fontWeight: weight.toString() as TextStyle["fontWeight"] };
    }
    if (weight === "bold") {
      return { fontWeight: "bold" };
    }
    return { fontWeight: "normal" };
  };

  // Compose fontSize style
  const getFontSizeStyle = (): StyleProp<TextStyle> => {
    const fontSize = fontSizeMap[size] || fontSizeMap[3];
    return { fontSize };
  };

  const alignStyle = align ? { textAlign: align } : undefined;

  return (
    <Text
      className={className}
      style={[
        getColorStyle(),
        getWeightStyle(),
        getFontSizeStyle(),
        getTypeStyle(),
        alignStyle,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizeMap[11],
  },
  midTitle: {
    fontSize: fontSizeMap[9],
  },
  subtitle: {
    fontSize: fontSizeMap[7],
  },
  miniSubtitle: {
    fontSize: fontSizeMap[5],
  },
  caption: {
    fontSize: fontSizeMap[1],
  },
  link: {
    textDecorationLine: "underline",
  },
  bold: {
    fontWeight: "bold",
  },
  badge: {
    fontWeight: "bold",
    fontSize: fontSizeMap[2],
  },
  label: {
    fontSize: fontSizeMap[2],
  },
  value: {
    fontWeight: "bold",
    fontSize: fontSizeMap[4],
  },
});
