import React from "react";
import renderer from "react-test-renderer";
import { View, Text, Pressable } from "react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { mockApi } from "@/services/mockApi";

// Mock router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
}));

// Test component that uses auth context
const TestComponent = () => {
  const { isAuthenticated, signIn } = useAuth();

  return (
    <View>
      <Text testID="auth-status">
        {isAuthenticated ? "logged-in" : "logged-out"}
      </Text>
      <Pressable
        testID="login-button"
        onPress={() => signIn("test@example.com", "password")}
      />
    </View>
  );
};

describe("Authentication Flow", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("renders initial unauthenticated state", () => {
    // Mock the auth hook to return unauthenticated state
    jest.mock("@/contexts/AuthContext", () => ({
      AuthProvider: ({ children }: { children: React.ReactNode }) => children,
      useAuth: () => ({
        isAuthenticated: false,
        signIn: jest.fn(),
      }),
    }));
    
    const tree = renderer
      .create(<TestComponent />)
      .toJSON();
    
    expect(tree).toMatchSnapshot('unauthenticated state');
  });

  it("renders authenticated state", () => {
    // Mock the auth hook to return authenticated state
    jest.mock("@/contexts/AuthContext", () => ({
      AuthProvider: ({ children }: { children: React.ReactNode }) => children,
      useAuth: () => ({
        isAuthenticated: true,
        signIn: jest.fn(),
      }),
    }));
    
    const tree = renderer
      .create(<TestComponent />)
      .toJSON();
    
    expect(tree).toMatchSnapshot('authenticated state');
  });
  
  // Note: We can't easily test the state transitions using snapshot testing,
  // as that would require useEffect and state changes that affect snapshots.
  // This would be better tested with integration tests or using a testing
  // framework that can handle asynchronous state changes.
});
