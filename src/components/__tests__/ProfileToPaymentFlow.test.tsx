import React from 'react';
import renderer from 'react-test-renderer';
import { View, Text, TouchableOpacity } from 'react-native';
import { FirstTimeProfileForm } from '@/components/profile/FirstTimeProfileForm';
import { PaymentMethodModal } from '@/components/payment/PaymentMethodModal';
import { MembershipPlan } from '@/types/membership';

// Mock necessary components
jest.mock('@/components/profile/FirstTimeProfileForm', () => ({
  FirstTimeProfileForm: ({ onComplete }: { onComplete: () => void }) => (
    <View testID="first-time-profile-form">
      <TouchableOpacity testID="submit-profile" onPress={onComplete}>
        <Text>Submit Profile</Text>
      </TouchableOpacity>
    </View>
  )
}));

jest.mock('@/components/payment/PaymentMethodModal', () => ({
  PaymentMethodModal: ({ visible, onComplete, selectedPlan, onClose }: { 
    visible: boolean; 
    onComplete: () => void; 
    selectedPlan: MembershipPlan;
    onClose: () => void;
  }) => (
    <View testID="payment-method-modal" style={{ display: visible ? 'flex' : 'none' }}>
      <Text>{selectedPlan?.name}</Text>
      <TouchableOpacity testID="complete-payment" onPress={onComplete}>
        <Text>Complete Payment</Text>
      </TouchableOpacity>
    </View>
  )
}));

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'user-123', hasCompletedProfile: false, hasPaymentMethod: false },
    updateFirstTimeProfile: jest.fn(),
    updatePaymentMethod: jest.fn(),
  })),
}));

// Create a test component to simulate the profile-to-payment flow
const ProfileToPaymentFlowTest = () => {
  const [step, setStep] = React.useState('profile'); // 'profile' or 'payment'
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  
  const handleProfileComplete = () => {
    setStep('payment');
    setShowPaymentModal(true);
  };
  
  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    // In a real app, we would update the user's payment method
  };
  
  return (
    <View>
      {step === 'profile' && (
        <View testID="profile-step">
          <Text>Complete Your Profile</Text>
          <FirstTimeProfileForm onComplete={handleProfileComplete} />
        </View>
      )}
      
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onComplete={handlePaymentComplete}
        selectedPlan={{
          id: 'basic',
          name: 'Basic Plan',
          price: 9.99,
          interval: 'month',
          description: 'Basic membership plan',
          benefits: ['Benefit 1', 'Benefit 2']
        }}
      />
    </View>
  );
};

describe('ProfileToPaymentFlow', () => {
  it('renders the profile step correctly', () => {
    const tree = renderer
      .create(<ProfileToPaymentFlowTest />)
      .toJSON();
    
    expect(tree).toMatchSnapshot('profile step');
  });
  
  it('renders correctly when transitioning to payment step', () => {
    const component = renderer.create(<ProfileToPaymentFlowTest />);
    
    // Find and press the submit profile button to trigger the transition
    const submitButton = component.root.findByProps({ testID: 'submit-profile' });
    
    renderer.act(() => {
      submitButton.props.onPress();
    });
    
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot('payment step');
  });
}); 