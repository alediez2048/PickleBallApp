import {
  Text,
  type TextProps,
  StyleSheet,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "defaultSemiBold"
    | "title"
    | "subtitle"
    | "subtitleCenter"
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

  return <Text style={[colorMatch, styleMatch, alignStyle, style]} {...rest} />;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontSize: 12,
    color: "#999",
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    textDecorationLine: "underline",
    color: "#007AFF", // fallback, can be overridden by colorType
  },
  bold: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  badge: {
    fontSize: 13,
    fontWeight: "600",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonCancel: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonWaitlist: {
    fontSize: 16,
    fontWeight: "600",
  },
  center: {
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
  },
});
