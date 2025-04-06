import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";

type ThemeContextType = {
  theme: ColorSchemeName;
  toggleTheme: () => void;
  colors: typeof Colors.light; // the same keys as in light/dark themes
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Define your light and dark colors
const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    primary: "#2f95dc",
    secondary: "#f4f4f5",
    tint: "#2f95dc",
    tabIconDefault: "#cccccc",
    tabIconSelected: "#2f95dc",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    primary: "#2f95dc",
    secondary: "#27272a",
    tint: "#ffffff",
    tabIconDefault: "#cccccc",
    tabIconSelected: "#ffffff",
  },
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState<ColorSchemeName>(systemTheme || "light");

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme || "light");
    });
    return () => subscription.remove();
  }, []);

  const colors = theme === "dark" ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};
