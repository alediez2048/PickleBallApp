export default {
  expo: {
    name: "PickleBallApp",
    slug: "PickleBallApp",
    owner: "yoimar",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "pickleballapp",
    platforms: ["ios", "android", "web"],
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.pickleballapp",
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.pickleballapp",
      intentFilters: [
        {
          action: "VIEW",
          data: {
            scheme: "pickleballapp",
            host: "redirect",
          },
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-secure-store",
      "expo-web-browser",
    ],
    experiments: {
      typedRoutes: true,
    },
    doctor: {
      reactNativeDirectoryCheck: {
        exclude: ["autoprefixer", "postcss", "react-native-sfsymbols"],
      },
    },
    extra: {
      eas: {
        projectId: "d6295ca2-1ea0-4c9e-911e-3a1382401db7",
      },
    },
  },
};
