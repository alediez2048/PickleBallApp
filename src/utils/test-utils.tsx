import React from 'react';
import { render as rtlRender } from '@testing-library/react-native';
import { AuthProvider } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';
import { UIProvider } from '@/contexts/UIContext';
import { BookedGamesProvider } from '@/contexts/BookedGamesContext';
import { View } from 'react-native';

// Mock components that might cause issues in tests
jest.mock('expo-image', () => 'Image');
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => 'TextInput');

// Wrapper component that includes all providers
const AllTheProviders = ({ children }: { children: React.ReactElement }) => {
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

// Custom render function
const render = (ui: React.ReactElement, options = {}) => {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
};

// Export everything
export * from '@testing-library/react-native';
export { render }; 