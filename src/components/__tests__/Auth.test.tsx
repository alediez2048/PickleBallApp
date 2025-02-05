import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { mockApi } from '@/services/mockApi';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock our mockApi
jest.mock('@/services/mockApi', () => ({
  mockApi: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

// Test component that uses auth context
const TestComponent: React.FC = () => {
  const { isAuthenticated, signIn, signUp, signOut } = useAuth();
  return (
    <View>
      <Pressable
        testID="login-button"
        onPress={() => signIn('test@example.com', 'password123')}
      >
        <Text>Login</Text>
      </Pressable>
      <Pressable
        testID="register-button"
        onPress={() => signUp('test@example.com', 'password123', 'Test User')}
      >
        <Text>Register</Text>
      </Pressable>
      <Pressable testID="logout-button" onPress={signOut}>
        <Text>Logout</Text>
      </Pressable>
      <Text testID="auth-status">{isAuthenticated ? 'logged-in' : 'logged-out'}</Text>
    </View>
  );
};

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should handle successful login', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const mockToken = 'mock-token';

    // Setup mock response
    (mockApi.login as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify initial unauthenticated state
    expect(getByTestId('auth-status').props.children).toBe('logged-out');

    // Trigger login
    fireEvent.press(getByTestId('login-button'));

    // Wait for state updates
    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe('logged-in');
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('should handle login failure', async () => {
    // Setup mock to reject
    (mockApi.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Trigger login
    fireEvent.press(getByTestId('login-button'));

    // Verify state remains unauthenticated
    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe('logged-out');
    });
  });

  it('should handle successful registration', async () => {
    const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const mockToken = 'mock-token';

    // Setup mock response
    (mockApi.register as jest.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Trigger registration
    fireEvent.press(getByTestId('register-button'));

    // Wait for state updates
    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe('logged-in');
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('should handle logout', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Trigger logout
    fireEvent.press(getByTestId('logout-button'));

    // Verify logged out state
    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe('logged-out');
      expect(router.replace).toHaveBeenCalledWith('/login');
    });
  });
}); 