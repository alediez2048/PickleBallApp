import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Button } from '@/components/common/ui/Button';
import { MembershipPlanModal } from './MembershipPlanModal';
import { PaymentMethodModal } from '@/components/payment/PaymentMethodModal';
import { MembershipPlan } from '@/types/membership';

interface MembershipManagementSectionProps {
  currentPlan?: MembershipPlan;
  onUpdatePlan: (plan: MembershipPlan) => void;
}

export function MembershipManagementSection({
  currentPlan,
  onUpdatePlan,
}: MembershipManagementSectionProps) {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  const handlePlanSelect = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setShowPlanModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    if (selectedPlan) {
      onUpdatePlan(selectedPlan);
    }
  };

  const formatPrice = (price: number, interval?: string) => {
    return `$${price}${interval ? `/${interval}` : ''}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Membership</Text>
        <Button
          onPress={() => setShowPlanModal(true)}
          style={styles.changeButton}
          variant="secondary"
        >
          <Text style={styles.buttonText}>Change Plan</Text>
        </Button>
      </View>

      {currentPlan ? (
        <View style={styles.planCard}>
          <View style={styles.planInfo}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{currentPlan.name}</Text>
              <Text style={styles.planPrice}>
                {formatPrice(currentPlan.price, currentPlan.interval)}
              </Text>
            </View>
            <Text style={styles.planDescription}>{currentPlan.description}</Text>
            <View style={styles.benefitsContainer}>
              {currentPlan.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <IconSymbol name="checkmark" size={16} color="#4CAF50" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <IconSymbol name="creditcard.fill" size={24} color="#666666" />
          <Text style={styles.emptyText}>No active membership</Text>
          <Text style={styles.emptySubtext}>
            Select a membership plan to enjoy exclusive benefits
          </Text>
        </View>
      )}

      <MembershipPlanModal
        visible={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onSelectPlan={handlePlanSelect}
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  changeButton: {
    paddingHorizontal: 16,
  },
  planCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  planInfo: {
    gap: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  planDescription: {
    fontSize: 14,
    color: '#666666',
  },
  benefitsContainer: {
    gap: 8,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333333',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
}); 