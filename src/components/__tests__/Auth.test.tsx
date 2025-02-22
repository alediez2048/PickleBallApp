import React from "react";
import { View, Text, Pressable } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { mockApi } from "@/services/mockApi";

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

  it("should handle successful login", async () => {
    const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
    const mockToken = "mock-token";

    // Setup mock response
    (mockApi.login as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Verify initial unauthenticated state
    expect(getByTestId("auth-status").props.children).toBe("logged-out");

    // Trigger login
    fireEvent.press(getByTestId("login-button"));

    // Wait for state updates
    await waitFor(() => {
      expect(getByTestId("auth-status").props.children).toBe("logged-in");
      expect(router.replace).toHaveBeenCalledWith("/(tabs)");
    });
  });

  it("should handle login failure", async () => {
    // Setup mock to reject
    (mockApi.login as jest.Mock).mockRejectedValueOnce(
      new Error("Invalid credentials"),
    );

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Trigger login
    fireEvent.press(getByTestId("login-button"));

    // Verify state remains unauthenticated
    await waitFor(() => {
      expect(getByTestId("auth-status").props.children).toBe("logged-out");
    });
  });
});
