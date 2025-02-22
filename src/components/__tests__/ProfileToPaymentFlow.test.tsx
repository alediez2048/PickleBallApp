import React from 'react';
import { View, Text, ViewProps, TextProps, TouchableOpacityProps } from 'react-native';
import { render, fireEvent, waitFor } from '@/utils/test-utils';
import { mockApi } from '@/services/mockApi';
import { FirstTimeProfileForm } from '@/components/profile/FirstTimeProfileForm';
import { PaymentMethodModal } from '@/components/payment/PaymentMethodModal';
import { Button } from '@/components/common/ui/Button';

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.View = ({ children, ...props }: ViewProps & { children?: React.ReactNode }) => 
    React.createElement('View', props, children);
  RN.Text = ({ children, ...props }: TextProps & { children?: React.ReactNode }) => 
    React.createElement('Text', props, children);
  RN.TouchableOpacity = ({ children, ...props }: TouchableOpacityProps & { children?: React.ReactNode }) => 
    React.createElement('TouchableOpacity', props, children);
  return RN;
});

// Mock the API
jest.mock('@/services/mockApi');

interface MockApi {
  login: jest.Mock;
  updateProfile: jest.Mock;
  updatePaymentMethod: jest.Mock;
  bookGame: jest.Mock;
  getGameDetails: jest.Mock;
}

const MockApi = mockApi as unknown as jest.Mocked<MockApi>;

// Mock navigation
jest.mock('expo-router', () => ({
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
  useLocalSearchParams: () => ({
    id: 'game-1'
  }),
}));

// Mock game details screen that implements the booking flow
const MockGameDetailsScreen = () => {
  const [showProfileForm, setShowProfileForm] = React.useState(false);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = React.useState(false);
  const [bookingSuccess, setBookingSuccess] = React.useState(false);

  const handleBookButtonPress = () => {
    setShowProfileForm(true);
  };

  const handleProfileComplete = () => {
    setShowProfileForm(false);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    setShowBookingConfirmation(true);
  };

  const handleBookingConfirm = async () => {
    try {
      await MockApi.bookGame('game-1');
      setBookingSuccess(true);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <View>
      <Button testID="book-button" onPress={handleBookButtonPress}>
        Book Game
      </Button>

      {showProfileForm && (
        <FirstTimeProfileForm onComplete={handleProfileComplete} />
      )}

      <PaymentMethodModal
        isVisible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onComplete={handlePaymentComplete}
        isFirstTime={true}
      />

      {showBookingConfirmation && (
        <View testID="booking-confirmation">
          <Button testID="confirm-booking" onPress={handleBookingConfirm}>
            Confirm Booking
          </Button>
        </View>
      )}

      {bookingSuccess && (
        <View testID="booking-success">
          <Text>Booking Successful!</Text>
        </View>
      )}
    </View>
  );
};

describe('Profile to Payment Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock initial user state
    MockApi.login.mockResolvedValue({
      token: 'test-token',
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        hasCompletedProfile: false,
        hasPaymentMethod: false
      }
    });

    // Mock successful profile update
    MockApi.updateProfile.mockResolvedValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        hasCompletedProfile: true,
        hasPaymentMethod: false
      }
    });

    // Mock successful payment method update
    MockApi.updatePaymentMethod.mockResolvedValue({
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        hasCompletedProfile: true,
        hasPaymentMethod: true
      }
    });

    // Mock successful game booking
    MockApi.bookGame.mockResolvedValue({
      id: 'booking-1',
      gameId: 'game-1',
      userId: '1',
      status: 'upcoming'
    });
  });

  it('shows payment modal after profile completion', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockGameDetailsScreen />
    );

    // Click book button
    fireEvent.press(getByTestId('book-button'));

    // Fill out profile form
    fireEvent.changeText(getByTestId('profile-name-input'), 'Test User');
    fireEvent.changeText(getByTestId('profile-phone-input'), '1234567890');
    fireEvent.changeText(getByTestId('profile-dob-input'), '1990-01-01');
    fireEvent.changeText(getByTestId('profile-address-input'), '123 Test St');
    fireEvent.changeText(getByTestId('profile-city-input'), 'Test City');
    fireEvent.changeText(getByTestId('profile-state-input'), 'TS');
    fireEvent.changeText(getByTestId('profile-zip-input'), '12345');

    // Accept terms
    fireEvent.press(getByTestId('terms-checkbox'));
    fireEvent.press(getByTestId('privacy-checkbox'));
    fireEvent.press(getByTestId('waiver-checkbox'));

    // Submit profile form
    fireEvent.press(getByTestId('profile-submit'));

    // Verify payment modal appears
    await waitFor(() => {
      expect(MockApi.updateProfile).toHaveBeenCalled();
      expect(getByTestId('payment-method-modal')).toBeTruthy();
    });

    // Verify profile form is hidden
    expect(queryByTestId('profile-form')).toBeNull();
  });

  it('completes full booking flow with profile and payment', async () => {
    const { getByTestId, queryByTestId } = render(
      <MockGameDetailsScreen />
    );

    // Start booking process
    fireEvent.press(getByTestId('book-button'));

    // Complete profile form
    fireEvent.changeText(getByTestId('profile-name-input'), 'Test User');
    fireEvent.changeText(getByTestId('profile-phone-input'), '1234567890');
    fireEvent.changeText(getByTestId('profile-dob-input'), '1990-01-01');
    fireEvent.changeText(getByTestId('profile-address-input'), '123 Test St');
    fireEvent.changeText(getByTestId('profile-city-input'), 'Test City');
    fireEvent.changeText(getByTestId('profile-state-input'), 'TS');
    fireEvent.changeText(getByTestId('profile-zip-input'), '12345');
    fireEvent.press(getByTestId('terms-checkbox'));
    fireEvent.press(getByTestId('privacy-checkbox'));
    fireEvent.press(getByTestId('waiver-checkbox'));
    fireEvent.press(getByTestId('profile-submit'));

    // Wait for payment modal
    await waitFor(() => {
      expect(getByTestId('payment-method-modal')).toBeTruthy();
    });

    // Complete payment form
    fireEvent.changeText(getByTestId('card-number-input'), '4242424242424242');
    fireEvent.changeText(getByTestId('card-expiry-input'), '12/25');
    fireEvent.changeText(getByTestId('card-cvc-input'), '123');
    fireEvent.press(getByTestId('payment-submit'));

    // Verify booking confirmation appears
    await waitFor(() => {
      expect(MockApi.updatePaymentMethod).toHaveBeenCalledWith(true);
      expect(getByTestId('booking-confirmation')).toBeTruthy();
      expect(queryByTestId('payment-method-modal')).toBeNull();
    });

    // Confirm booking
    fireEvent.press(getByTestId('confirm-booking'));

    // Verify booking completion
    await waitFor(() => {
      expect(MockApi.bookGame).toHaveBeenCalledWith('game-1');
      expect(getByTestId('booking-success')).toBeTruthy();
    });
  });
}); 