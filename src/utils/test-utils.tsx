import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';
import { UIProvider } from '@/contexts/UIContext';
import { BookedGamesProvider } from '@/contexts/BookedGamesContext';
import { View } from 'react-native';

// Mock components that might cause issues in tests
jest.mock('expo-image', () => 'Image');
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => 'TextInput');

// Mock implementations
jest.mock('@/contexts/AuthContext', () => {
  const originalModule = jest.requireActual('@/contexts/AuthContext');
  return {
    ...originalModule,
    useAuth: () => ({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        hasCompletedProfile: true,
        paymentMethods: [],
      },
      isAuthenticated: true,
      token: 'test-token',
      isLoading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithFacebook: jest.fn(),
      updateProfile: jest.fn(),
      updateFirstTimeProfile: jest.fn(),
      updateMembership: jest.fn(),
      updatePaymentMethods: jest.fn(),
      updatePaymentMethod: jest.fn(), // Add this missing method
    }),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Wrapper component that includes all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <UIProvider>
        <GameProvider>
          <BookedGamesProvider>
            <View style={{ flex: 1 }}>{children}</View>
          </BookedGamesProvider>
        </GameProvider>
      </UIProvider>
    </AuthProvider>
  );
};

// Custom render with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Export everything
export * from '@testing-library/react-native';
export { customRender as render }; 