/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.tsx",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#4CAF50",
          DEFAULT: "#2E7D32",
          dark: "#1B5E20",
        },
        secondary: {
          light: "#FF9800",
          DEFAULT: "#F57C00",
          dark: "#E65100",
        },
      },
      fontFamily: {
        sans: ["System"],
        "sans-medium": ["System-Medium"],
        "sans-bold": ["System-Bold"],
      },
      spacing: {
        '3': '12px', // px-4
        '4': '16px', // px-4
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
