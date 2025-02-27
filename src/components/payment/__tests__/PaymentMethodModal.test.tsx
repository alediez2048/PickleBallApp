import React from 'react';
import renderer from 'react-test-renderer';
import { PaymentMethodModal } from '../PaymentMethodModal';
import { MembershipPlan } from '@/types/membership';

// Mock the PaymentMethodForm component to simplify testing
jest.mock('../PaymentMethodForm', () => ({
  PaymentMethodForm: () => "MockPaymentMethodForm"
}));

describe('PaymentMethodModal', () => {
  const mockOnClose = jest.fn();
  const mockOnComplete = jest.fn();
  const mockPlan: MembershipPlan = {
    id: 'test-plan',
    name: 'Test Plan',
    price: 10,
    interval: 'month',
    description: 'Test description',
    benefits: ['Benefit 1', 'Benefit 2'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with selected plan', () => {
    const tree = renderer
      .create(
        <PaymentMethodModal
          visible={true}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          selectedPlan={mockPlan}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when not visible', () => {
    const tree = renderer
      .create(
        <PaymentMethodModal
          visible={false}
          onClose={mockOnClose}
          onComplete={mockOnComplete}
          selectedPlan={mockPlan}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
}); 