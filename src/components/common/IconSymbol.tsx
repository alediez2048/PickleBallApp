// This file is a fallback for using MaterialIcons on Android and web.

import React from "react";
import { Platform, StyleProp, TextStyle } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// Only import SFSymbols on iOS
let SFSymbol: any;
if (Platform.OS === "ios") {
  SFSymbol = require("react-native-sfsymbols").SFSymbol;
}

// Icon name mapping between SF Symbols and Material Icons
const ICON_MAPPING = {
  "house.fill": "home",
  "gamecontroller.fill": "games",
  "person.fill.badge.plus": "person-add",
  "exclamationmark.triangle.fill": "warning",
  "trophy.fill": "emoji-events",
  "person.fill": "person",
  pencil: "edit",
  xmark: "close",
  checkmark: "check",
  "location.fill": "location-on",
  calendar: "calendar-today",
  "person.2.fill": "people",
  "star.fill": "star",
  "chevron.down": "keyboard-arrow-down",
  "creditcard.fill": "credit-card",
  "gearshape.fill": "settings",
  filter: "filter-list", // <-- Add Material Icon for 'filter'
} as const;

type IconName =
  | "person.fill"
  | "house.fill"
  | "gamecontroller.fill"
  | "person.fill.badge.plus"
  | "exclamationmark.triangle.fill"
  | "trophy.fill"
  | "pencil"
  | "xmark"
  | "checkmark"
  | "location.fill"
  | "calendar"
  | "person.2.fill"
  | "star.fill"
  | "chevron.down"
  | "creditcard.fill"
  | "gearshape.fill"
  | "filter"; // <-- Add 'filter' to IconName

interface IconSymbolProps {
  name: IconName;
  size?: number;
  color?:
    | "default"
    | "black"
    | "white"
    | "primary"
    | "secondary"
    | "text"
    | string;
  style?: StyleProp<TextStyle>;
}

export function IconSymbol({
  name,
  size = 24,
  color = "default",
  style,
}: IconSymbolProps) {
  // Determine the color to use
  let themedColor = color;
  // Accept colorType or a valid hex color string
  const isHexColor = (val: string) => /^#([0-9A-Fa-f]{6})$/.test(val);

  if (typeof color === "string" && isHexColor(color)) {
    themedColor = color;
  } else {
    try {
      const { useTheme } = require("@/contexts/ThemeContext");
      const { colors } = useTheme();
      switch (color) {
        case "black":
          themedColor = colors.black;
          break;
        case "white":
          themedColor = colors.white;
          break;
        case "primary":
          themedColor = colors.primary;
          break;
        case "secondary":
          themedColor = colors.secondary;
          break;
        case "text":
          themedColor = colors.text;
          break;
        default:
          themedColor = colors.text;
      }
    } catch (e) {
      // fallback to provided color
    }
  }

  // Use SF Symbols on iOS, Material Icons elsewhere
  if (Platform.OS === "ios" && SFSymbol) {
    return (
      <SFSymbol name={name} size={size} color={themedColor} style={style} />
    );
  }

  return (
    <MaterialIcons
      name={ICON_MAPPING[name]}
      size={size}
      color={themedColor}
      style={style}
    />
  );
}
