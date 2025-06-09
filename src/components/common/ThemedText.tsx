import {
  Text,
  type TextProps,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  Platform,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "defaultSemiBold"
    | "title"
    | "subtitle"
    | "subtitleCenter"
    | "miniSubtitle"
    | "paragraph"
    | "paragraphCenter"
    | "caption"
    | "link"
    | "bold"
    | "label"
    | "value"
    | "sectionTitle"
    | "badge"
    | "emptyStateTitle"
    | "emptyStateText"
    | "button"
    | "buttonDisabled"
    | "buttonCancel"
    | "buttonWaitlist";
  colorType?: "default" | "black" | "white" | "primary" | "secondary" | "label";
  align?: "left" | "center" | "right" | "justify";
};

export function ThemedText({
  style,
  type = "default",
  colorType = "default",
  align,
  ...rest
}: ThemedTextProps) {
  const { colors } = useTheme();

  const getTypeStyle = (): StyleProp<TextStyle> => {
    switch (type) {
      case "title":
        return styles.title;
      case "defaultSemiBold":
        return styles.defaultSemiBold;
      case "subtitle":
        return styles.subtitle;
      case "miniSubtitle":
        return styles.miniSubtitle;
      case "subtitleCenter":
        return [styles.subtitle, styles.center];
      case "paragraph":
        return styles.paragraph;
      case "paragraphCenter":
        return [styles.paragraph, styles.center];
      case "caption":
        return styles.caption;
      case "link":
        return styles.link;
      case "bold":
        return styles.bold;
      case "sectionTitle":
        return styles.sectionTitle;
      case "badge":
        return styles.badge;
      case "emptyStateTitle":
        return styles.emptyStateTitle;
      case "emptyStateText":
        return styles.emptyStateText;
      case "button":
        return styles.button;
      case "buttonDisabled":
        return styles.buttonDisabled;
      case "buttonCancel":
        return styles.buttonCancel;
      case "buttonWaitlist":
        return styles.buttonWaitlist;
      case "label":
        return styles.label;
      case "value":
        return styles.value;
      default:
        return styles.default;
    }
  };

  const getColorStyle = (): StyleProp<TextStyle> => {
    switch (colorType) {
      case "black":
        return { color: colors.black };
      case "white":
        return { color: colors.white };
      case "primary":
        return { color: colors.primary };
      case "secondary":
        return { color: colors.secondary };
      case "label":
        return { color: colors.label };
      default:
        return { color: colors.text };
    }
  };

  const styleMatch = getTypeStyle();
  const colorMatch = getColorStyle();
  const alignStyle = align ? { textAlign: align } : undefined;
  const allText = styles.all;

  return (
    <Text
      style={[allText, colorMatch, styleMatch, alignStyle, style]}
      {...rest}
    />
  );
}

const fontSizeOffset = Platform.OS === "ios" ? -2 : 0;

const styles = StyleSheet.create({
  all: {
    fontSize: 16 + fontSizeOffset,
    lineHeight: 16 + fontSizeOffset,
  },
  default: {
    fontSize: 16 + fontSizeOffset,
    lineHeight: 24 + fontSizeOffset,
  },
  defaultSemiBold: {
    fontSize: 16 + fontSizeOffset,
    lineHeight: 24 + fontSizeOffset,
    fontWeight: "600",
  },
  title: {
    fontSize: 32 + fontSizeOffset,
    fontWeight: "bold",
    lineHeight: 32 + fontSizeOffset,
  },
  subtitle: {
    fontSize: 18 + fontSizeOffset,
    fontWeight: "bold",
    lineHeight: 24 + fontSizeOffset,
  },
  miniSubtitle: {
    fontSize: 14 + fontSizeOffset,
    fontWeight: "bold",
  },
  paragraph: {
    fontSize: 15 + fontSizeOffset,
    lineHeight: 22 + fontSizeOffset,
  },
  caption: {
    fontSize: 12 + fontSizeOffset,
    color: "#999",
  },
  link: {
    fontSize: 16 + fontSizeOffset,
    lineHeight: 24 + fontSizeOffset,
    textDecorationLine: "underline",
    color: "#007AFF", // fallback, can be overridden by colorType
  },
  bold: {
    fontSize: 16 + fontSizeOffset,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 24 + fontSizeOffset,
    fontWeight: "700",
    marginBottom: 4,
  },
  badge: {
    fontSize: 13 + fontSizeOffset,
    fontWeight: "600",
  },
  emptyStateTitle: {
    fontSize: 18 + fontSizeOffset,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14 + fontSizeOffset,
    textAlign: "center",
    lineHeight: 20 + fontSizeOffset,
  },
  button: {
    fontSize: 16 + fontSizeOffset,
    fontWeight: "600",
  },
  buttonDisabled: {
    fontSize: 16 + fontSizeOffset,
    fontWeight: "600",
  },
  buttonCancel: {
    fontSize: 16 + fontSizeOffset,
    fontWeight: "600",
  },
  buttonWaitlist: {
    fontSize: 16 + fontSizeOffset,
    fontWeight: "600",
  },
  center: {
    textAlign: "center",
  },
  label: {
    fontSize: 14 + fontSizeOffset,
    fontWeight: "500",
  },
  value: {
    fontSize: 18 + fontSizeOffset,
    fontWeight: "700",
  },
});
