import "@testing-library/jest-native/extend-expect";
import { setupTestingLibrary } from "./src/utils/testing/renderWithoutUnmounting";

// Initialize our custom testing library
setupTestingLibrary();

// Mock Expo modules
jest.mock("expo-font");
jest.mock("expo-asset");
jest.mock("expo-image", () => "Image");
jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      apiUrl: "https://api.test.com",
    },
  },
}));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock expo-symbols
jest.mock("expo-symbols", () => ({
  SymbolView: "SymbolView",
  SymbolWeight: {
    REGULAR: "REGULAR",
    BOLD: "BOLD",
    SEMIBOLD: "SEMIBOLD",
  },
}));

// Mock web-browser and auth-session
jest.mock("expo-web-browser", () => ({
  openAuthSessionAsync: jest.fn(),
  dismissAuthSession: jest.fn(),
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock("expo-auth-session", () => ({
  exchangeCodeAsync: jest.fn(),
  makeRedirectUri: jest.fn(),
  useAuthRequest: jest.fn(),
  getDefaultReturnUrl: jest.fn(),
  startAsync: jest.fn(),
}));

// Remove CSS Interop mocks - these are now handled by the transformer
// The following mocks are commented out and kept for reference

/*
// Create a simple mock factory for CSS interop modules
const createCssInteropMock = () => ({
  css: jest.fn(() => () => ({})),
  withStyleSheet: jest.fn((styles) => (component) => component),
  getColorScheme: jest.fn(() => 'light'),
  addAppearanceListener: jest.fn(() => () => {}),
  removeAppearanceListener: jest.fn(() => {}),
  resolveVariables: jest.fn(() => ({})),
  processCssProperties: jest.fn(() => ({})),
  getVariableValue: jest.fn(() => '#000000'),
  createTokens: jest.fn(() => ({})),
  cssInterop: jest.fn(() => ({})),
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
});

jest.mock('react-native-css-interop', () => createCssInteropMock());
jest.mock('react-native-css-interop/src/runtime/native/appearance-observables', () => ({
  getColorScheme: jest.fn(() => 'light'),
  addAppearanceListener: jest.fn(() => ({ remove: jest.fn() })),
  removeAppearanceListener: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  resetAppearanceListeners: jest.fn(),
}));
jest.mock('react-native-css-interop/src/runtime/native/api', () => ({
  resolveVariables: jest.fn(() => ({})),
  processCssProperties: jest.fn(() => ({})),
  getVariableValue: jest.fn(() => '#000000'),
}));
jest.mock('react-native-css-interop/src/runtime/api.native', () => ({}));
jest.mock('react-native-css-interop/src/runtime/wrap-jsx', () => ({}));
jest.mock('react-native-css-interop/src/runtime/jsx-runtime', () => ({}));
*/

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Mock expo-router with more complete implementation
jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({ id: "test-id" }),
  Link: "Link",
  Slot: "Slot",
  Stack: "Stack",
  Tabs: "Tabs",
}));

// Simple React Native component mocks
jest.mock(
  "react-native/Libraries/Components/Touchable/TouchableOpacity",
  () => "TouchableOpacity"
);

// Mock useColorScheme hook
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
  default: () => "light",
}));

// Mock component files directly with more complete implementations
jest.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children, style, variant, ...props }) => {
    return {
      type: "ThemedText",
      props: { children, style, variant, ...props },
      $$typeof: Symbol.for("react.element"),
    };
  },
}));

jest.mock("@/components/ThemedView", () => ({
  ThemedView: ({ children, style, ...props }) => {
    return {
      type: "ThemedView",
      props: { children, style, ...props },
      $$typeof: Symbol.for("react.element"),
    };
  },
}));

jest.mock("@/components/ui/IconSymbol", () => ({
  IconSymbol: ({ name, size, color, ...props }) => {
    return {
      type: "IconSymbol",
      props: { name, size, color, ...props },
      $$typeof: Symbol.for("react.element"),
    };
  },
}));

// Mock common UI components
jest.mock("@/components/common/ui/Button", () => ({
  Button: ({ children, variant, size, onPress, ...props }) => {
    return {
      type: "Button",
      props: { children, variant, size, onPress, ...props },
      $$typeof: Symbol.for("react.element"),
    };
  },
}));

jest.mock("@/components/common/ui/TextInput", () => ({
  TextInput: ({ value, onChangeText, placeholder, ...props }) => {
    return {
      type: "TextInput",
      props: { value, onChangeText, placeholder, ...props },
      $$typeof: Symbol.for("react.element"),
    };
  },
}));

jest.mock("@/components/common/ui/LoadingSpinner", () => ({
  LoadingSpinner: ({ message, ...props }) => {
    return {
      type: "LoadingSpinner",
      props: { message, ...props },
      $$typeof: Symbol.for("react.element"),
    };
  },
}));

// Mock hooks
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: jest.fn(() => "light"),
  default: jest.fn(() => "light"),
}));

// Mock context consumers
jest.mock("@/contexts/selectors/uiSelectors", () => ({
  useUIState: jest.fn(() => ({ colorScheme: "light", theme: "default" })),
  useToastState: jest.fn(() => ({ toasts: [] })),
  useThemedColor: jest.fn(() => ({
    primary: "#000000",
    background: "#FFFFFF",
  })),
}));

jest.mock("@/contexts/selectors/authSelectors", () => ({
  useAuthState: jest.fn(() => ({ user: null, isAuthenticated: false })),
  useSocialAuthState: jest.fn(() => ({ socialAuthInProgress: false })),
}));

jest.mock("@/contexts/selectors/gameSelectors", () => ({
  useGamesState: jest.fn(() => ({ games: [], isLoading: false })),
  usePaginatedGames: jest.fn(() => ({
    games: [],
    loadMore: jest.fn(),
    isLoading: false,
  })),
}));

// Mock safe-area-context
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock image picker
jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: "granted" })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      canceled: false,
      assets: [
        {
          uri: "test-uri",
          base64: "test-base64",
        },
      ],
    })
  ),
  MediaTypeOptions: { Images: "images" },
}));

// Enhanced mockApi with more complete implementation
jest.mock("@/services/mockApi", () => ({
  mockApi: {
    login: jest.fn().mockResolvedValue({
      token: "test-token",
      user: {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        hasCompletedProfile: true,
      },
    }),
    register: jest.fn().mockResolvedValue({
      token: "test-token",
      user: {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        hasCompletedProfile: false,
      },
    }),
    updateProfile: jest.fn().mockResolvedValue({
      user: {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        hasCompletedProfile: true,
      },
    }),
    getGameBookings: jest.fn().mockResolvedValue(5),
    bookGame: jest.fn().mockResolvedValue({
      id: "booking-1",
      gameId: "game-1",
      status: "upcoming",
    }),
  },
}));

// Mock storage
const storageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Set up global mocks
global.localStorage = storageMock;
global.window = {
  ...global.window,
  dispatchEvent: jest.fn(),
};

// Configure console mocks
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  error: jest.fn(),
};

// Add more specific hook mocks
jest.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: jest.fn().mockReturnValue("light"),
  default: jest.fn().mockReturnValue("light"),
}));

// Mock @hooks/useColorScheme for path alias resolution
jest.mock(
  "@hooks/useColorScheme",
  () => ({
    useColorScheme: jest.fn().mockReturnValue("light"),
    default: jest.fn().mockReturnValue("light"),
  }),
  { virtual: true }
);

// Mock appearance hooks more extensively
jest.mock("react-native", () => {
  // Use a simple mock instead of referencing a non-existent module
  return {
    StyleSheet: {
      create: (styles) => styles,
      hairlineWidth: 1,
      absoluteFill: {},
      flatten: jest.fn((style) => style),
      compose: jest.fn((...styles) => Object.assign({}, ...styles)),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
    },
    Platform: {
      OS: "ios",
      select: jest.fn((obj) => obj.ios),
      Version: 14,
      isPad: false,
      isTV: false,
    },
    Animated: {
      Value: jest.fn(() => ({
        interpolate: jest.fn(() => ({
          __getValue: jest.fn(() => 0),
        })),
        setValue: jest.fn(),
        addListener: jest.fn(() => ({ remove: jest.fn() })),
        removeAllListeners: jest.fn(),
        stopAnimation: jest.fn(),
        __getValue: jest.fn(() => 0),
      })),
      timing: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
      })),
      spring: jest.fn(() => ({
        start: jest.fn((callback) => callback && callback({ finished: true })),
      })),
      decay: jest.fn(() => ({ start: jest.fn() })),
      View: "Animated.View",
      Text: "Animated.Text",
      Image: "Animated.Image",
      ScrollView: "Animated.ScrollView",
      createAnimatedComponent: jest.fn((component) => `Animated.${component}`),
      event: jest.fn(() => jest.fn()),
    },
    useColorScheme: jest.fn().mockReturnValue("light"),
    Appearance: {
      getColorScheme: jest.fn().mockReturnValue("light"),
      addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    View: "View",
    Text: "Text",
    Image: "Image",
    ScrollView: "ScrollView",
    FlatList: "FlatList",
    SectionList: "SectionList",
    ActivityIndicator: "ActivityIndicator",
    TouchableOpacity: "TouchableOpacity",
    TouchableHighlight: "TouchableHighlight",
    Modal: "Modal",
    Alert: {
      alert: jest.fn(),
    },
    Linking: {
      openURL: jest.fn(),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
    },
    KeyboardAvoidingView: "KeyboardAvoidingView",
    SafeAreaView: "SafeAreaView",
    Pressable: "Pressable",
    ColorSchemeName: {},
    TextInput: "TextInput",
  };
});
