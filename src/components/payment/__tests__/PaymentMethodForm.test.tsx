import React from 'react';
import renderer from 'react-test-renderer';
import { PaymentMethodForm } from '../PaymentMethodForm';
import { Alert } from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock the useAuth hook
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      hasCompletedProfile: true,
      paymentMethods: [],
    },
    updatePaymentMethods: jest.fn(),
  }),
}));

describe('PaymentMethodForm', () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const tree = renderer
      .create(
        <PaymentMethodForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly in first-time mode', () => {
    const tree = renderer
      .create(
        <PaymentMethodForm
          onComplete={mockOnComplete}
          onCancel={mockOnCancel}
          isFirstTime={true}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
}); 