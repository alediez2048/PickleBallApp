import React from 'react';
import { View } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { mockApi } from '@/services/mockApi';
import { AuthProvider } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';
import { UIProvider } from '@/contexts/UIContext';
import { BookedGamesProvider } from '@/contexts/BookedGamesContext';

// Mock the navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: { id: 'game-1' },
  }),
}));

// Mock the game details screen
jest.mock('../../app/game/[id]', () => ({
  default: () => <View testID="game-details">Game Details Screen</View>,
}));

// Extend the mock API interface
type MockInstance<T = any, Y extends any[] = any[], R = any> = jest.Mock<T, Y, R>;

interface MockApi {
  login: MockInstance;
  updateProfile: MockInstance;
  updatePaymentMethod: MockInstance;
  bookGame: MockInstance;
}

// Mock the API
jest.mock('@/services/mockApi');
const MockApi = mockApi as unknown as jest.Mocked<MockApi>;

// Create a wrapper component with all required providers
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <GameProvider>
      <UIProvider>
        <BookedGamesProvider>
          {children}
        </BookedGamesProvider>
      </UIProvider>
    </GameProvider>
  </AuthProvider>
);

describe('Game Registration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows profile form when user profile is incomplete', async () => {
    // Mock an authenticated user with incomplete profile
    MockApi.login.mockResolvedValueOnce({
      token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        hasPaymentMethod: false,
        hasCompletedProfile: false
      }
    });

    const { getByTestId, queryByTestId } = render(
      <View testID="game-details">Game Details Screen</View>,
      { wrapper }
    );

    // Click book button
    fireEvent.press(getByTestId('book-button'));

    // Profile form should be visible
    expect(getByTestId('profile-form')).toBeTruthy();
    // Payment form should not be visible yet
    expect(queryByTestId('payment-form')).toBeNull();
  });

  it('shows payment form after profile completion', async () => {
    // Mock an authenticated user with complete profile but no payment method
    MockApi.login.mockResolvedValueOnce({
      token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        hasPaymentMethod: false,
        hasCompletedProfile: true
      }
    });

    const { getByTestId, queryByTestId } = render(
      <View testID="game-details">Game Details Screen</View>,
      { wrapper }
    );

    // Click book button
    fireEvent.press(getByTestId('book-button'));

    // Payment form should be visible
    expect(getByTestId('payment-form')).toBeTruthy();
    // Profile form should not be visible
    expect(queryByTestId('profile-form')).toBeNull();
  });

  it('shows booking confirmation after payment method added', async () => {
    // Mock an authenticated user with complete profile and payment method
    MockApi.login.mockResolvedValueOnce({
      token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        hasPaymentMethod: true,
        hasCompletedProfile: true
      }
    });

    const { getByTestId, queryByTestId } = render(
      <View testID="game-details">Game Details Screen</View>,
      { wrapper }
    );

    // Click book button
    fireEvent.press(getByTestId('book-button'));

    // Booking confirmation should be visible
    expect(getByTestId('booking-confirmation')).toBeTruthy();
    // Profile and payment forms should not be visible
    expect(queryByTestId('profile-form')).toBeNull();
    expect(queryByTestId('payment-form')).toBeNull();
  });

  it('completes full registration flow successfully', async () => {
    // Mock initial user state
    MockApi.login.mockResolvedValueOnce({
      token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        hasPaymentMethod: false,
        hasCompletedProfile: false
      }
    });

    // Mock profile update
    MockApi.updateProfile.mockResolvedValueOnce({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        hasPaymentMethod: false,
        hasCompletedProfile: true
      }
    });

    // Mock payment method update
    MockApi.updatePaymentMethod.mockResolvedValueOnce({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        hasPaymentMethod: true,
        hasCompletedProfile: true
      }
    });

    // Mock game booking
    MockApi.bookGame.mockResolvedValueOnce({
      id: 'booking-1',
      gameId: 'game-1',
      date: new Date().toISOString(),
      time: '14:00',
      courtName: 'Test Court',
      location: {
        address: '123 Test St',
        area: 'Test Area',
        city: 'Test City'
      },
      skillRating: 3,
      price: 10,
      status: 'upcoming'
    });

    const { getByTestId, queryByTestId } = render(
      <View testID="game-details">Game Details Screen</View>,
      { wrapper }
    );

    // Start booking process
    fireEvent.press(getByTestId('book-button'));

    // Complete profile form
    const profileForm = getByTestId('profile-form');
    fireEvent.changeText(getByTestId('profile-name-input'), 'Updated Name');
    fireEvent.press(getByTestId('profile-submit'));

    await waitFor(() => {
      expect(queryByTestId('profile-form')).toBeNull();
      expect(getByTestId('payment-form')).toBeTruthy();
    });

    // Complete payment form
    const paymentForm = getByTestId('payment-form');
    fireEvent.changeText(getByTestId('card-number-input'), '4242424242424242');
    fireEvent.press(getByTestId('payment-submit'));

    await waitFor(() => {
      expect(queryByTestId('payment-form')).toBeNull();
      expect(getByTestId('booking-confirmation')).toBeTruthy();
    });

    // Confirm booking
    fireEvent.press(getByTestId('confirm-booking'));

    await waitFor(() => {
      expect(MockApi.bookGame).toHaveBeenCalled();
      expect(getByTestId('booking-success')).toBeTruthy();
    });
  });
}); 