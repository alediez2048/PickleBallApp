import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Button } from '@/components/common/ui/Button';
import { MembershipPlanModal } from './MembershipPlanModal';
import { PaymentMethodModal } from '@/components/payment/PaymentMethodModal';
import { MembershipPlan } from '@/types/membership';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';

interface MembershipManagementSectionProps {
  currentPlan?: MembershipPlan;
  onUpdatePlan: (plan: MembershipPlan) => void;
}

export function MembershipManagementSection({
  currentPlan,
  onUpdatePlan,
}: MembershipManagementSectionProps) {
  const { user } = useAuth();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Debug logging
  useEffect(() => {
    console.log('MembershipManagementSection - Component mounted');
    console.log('MembershipManagementSection - currentPlan:', currentPlan);
    console.log('MembershipManagementSection - user:', user);
    console.log('MembershipManagementSection - user.paymentMethods:', user?.paymentMethods);
  }, [currentPlan, user, refreshKey]);
  
  // Mock payment method for testing - only used if no real payment methods exist
  const mockPaymentMethod = {
    id: 'mock-payment-1',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: '12',
    expiryYear: '25',
    isDefault: true
  };
  
  // Check if user has a payment method - use real data if available
  const hasPaymentMethod = user?.paymentMethods && user.paymentMethods.length > 0;
  
  // Get default payment method if available - use real data if available
  const defaultPaymentMethod = user?.paymentMethods?.find(method => method.isDefault);
  
  // Debug logging for payment methods
  useEffect(() => {
    console.log('MembershipManagementSection - hasPaymentMethod:', hasPaymentMethod);
    console.log('MembershipManagementSection - defaultPaymentMethod:', defaultPaymentMethod);
  }, [hasPaymentMethod, defaultPaymentMethod, refreshKey]);

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    
    // If selecting the same plan, just close the modal
    if (currentPlan && plan.id === currentPlan.id) {
      Alert.alert(
        'Current Plan',
        `You are already subscribed to the ${plan.name} plan.`,
        [
          {
            text: 'OK',
            onPress: () => setShowPlanModal(false),
          },
        ]
      );
      return;
    }
    
    // If changing between paid plans
    if (currentPlan) {
      Alert.alert(
        'Change Plan',
        `Are you sure you want to change to the ${plan.name} plan? Your billing will be updated to ${formatPrice(plan.price, plan.interval)}.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Change Plan',
            onPress: () => {
              setShowPlanModal(false);
              onUpdatePlan(plan);
            },
          },
        ]
      );
      return;
    }
    
    // If no current plan, show payment modal for new plan
    if (hasPaymentMethod) {
      Alert.alert(
        'Confirm Plan Selection',
        `Are you sure you want to select the ${plan.name} plan? You will be charged ${formatPrice(plan.price, plan.interval)}.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Confirm',
            onPress: () => {
              setShowPlanModal(false);
              onUpdatePlan(plan);
            },
          },
        ]
      );
    } else {
      // If no payment method, show payment modal
      setShowPlanModal(false);
      setShowPaymentModal(true);
    }
  };

  const handlePaymentComplete = () => {
    console.log('MembershipManagementSection - Payment complete called');
    setShowPaymentModal(false);
    
    // Force a refresh to ensure we display the latest payment method
    setRefreshKey(prev => prev + 1);
    
    if (selectedPlan) {
      console.log('MembershipManagementSection - Updating plan after payment:', selectedPlan);
      onUpdatePlan(selectedPlan);
    }
  };

  const formatPrice = (price: number, interval?: string) => {
    return `$${price}${interval ? `/${interval}` : ''}`;
  };

  // Determine the primary action based on current plan
  const getPrimaryAction = () => {
    if (!currentPlan) {
      return (
        <Button 
          variant="primary"
          onPress={() => setShowPlanModal(true)}
          style={styles.actionButton}
        >
          Select a Plan
        </Button>
      );
    }
    
    return (
      <View style={styles.actionButtonsRow}>
        <Button 
          variant="outline"
          onPress={() => setShowPlanModal(true)}
          style={[styles.actionButton, styles.actionButtonHalf]}
        >
          Change Plan
        </Button>
        <Button 
          variant="outline"
          onPress={() => {
            setSelectedPlan(currentPlan);
            setShowPaymentModal(true);
          }}
          style={[styles.actionButton, styles.actionButtonHalf]}
        >
          Update Payment
        </Button>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {currentPlan ? (
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={styles.planTitleContainer}>
              <ThemedText variant="subtitle" style={styles.planName}>
                {currentPlan.name}
              </ThemedText>
              <View style={styles.activeBadge}>
                <ThemedText style={styles.activeBadgeText}>Active</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.planPrice}>
              {formatPrice(currentPlan.price, currentPlan.interval)}
            </ThemedText>
          </View>
          
          <ThemedText variant="caption" style={styles.planDescription}>
            {currentPlan.description}
          </ThemedText>
          
          <View style={styles.divider} />
          
          <View style={styles.benefitsContainer}>
            <ThemedText style={styles.benefitsSectionTitle}>Plan Benefits:</ThemedText>
            {currentPlan.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
              </View>
            ))}
          </View>
          
          {defaultPaymentMethod && (
            <>
              <View style={styles.divider} />
              <View style={styles.paymentMethodContainer}>
                <ThemedText style={styles.paymentSectionTitle}>Payment Method:</ThemedText>
                <View style={styles.paymentMethodRow}>
                  <IconSymbol 
                    name="creditcard.fill" 
                    size={16} 
                    color="#666666" 
                    style={styles.paymentIcon} 
                  />
                  <ThemedText style={styles.paymentText}>
                    {defaultPaymentMethod.brand} •••• {defaultPaymentMethod.last4}
                  </ThemedText>
                </View>
                <ThemedText variant="caption" style={styles.paymentExpiry}>
                  Expires {defaultPaymentMethod.expiryMonth}/{defaultPaymentMethod.expiryYear}
                </ThemedText>
              </View>
            </>
          )}
          
          <View style={styles.actionsContainer}>
            {getPrimaryAction()}
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <IconSymbol name="creditcard.fill" size={24} color="#FFFFFF" />
          </View>
          <ThemedText style={styles.emptyText}>No active membership</ThemedText>
          <ThemedText variant="caption" style={styles.emptySubtext}>
            Select a membership plan to enjoy exclusive benefits
          </ThemedText>
          <Button 
            variant="primary"
            size="small"
            onPress={() => setShowPlanModal(true)}
            style={styles.emptyStateButton}
          >
            Select a Plan
          </Button>
        </View>
      )}

      <MembershipPlanModal
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSelectPlan={handlePlanSelect}
        currentPlanId={currentPlan?.id}
      />

      {selectedPlan && (
        <PaymentMethodModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
          selectedPlan={selectedPlan}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  planCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 8,
    gap: 8,
  },
  planName: {
    fontWeight: '600',
    color: '#666666',
    fontSize: 18,
    flexShrink: 1,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  planDescription: {
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  benefitsContainer: {
    gap: 10,
    marginBottom: 12,
  },
  benefitsSectionTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  paymentMethodContainer: {
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
  },
  paymentSectionTitle: {
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentIcon: {
    marginRight: 8,
  },
  paymentText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  paymentExpiry: {
    color: '#666666',
    marginLeft: 24,
  },
  actionsContainer: {
    marginTop: 16,
  },
  actionButton: {
    width: '100%',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButtonHalf: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIconContainer: {
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  emptySubtext: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyStateButton: {
    marginTop: 8,
    minWidth: 200,
  },
}); 