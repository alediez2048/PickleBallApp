import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Button } from '@/components/common/ui/Button';
import { MembershipPlanModal } from './MembershipPlanModal';
import { PaymentMethodModal } from '@/components/payment/PaymentMethodModal';
import { MembershipPlan } from '@/types/membership';
import { ThemedText } from '@/components/ThemedText';

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
        <ThemedText variant="subtitle" style={styles.title}>Membership</ThemedText>
        <Button
          onPress={() => setShowPlanModal(true)}
          variant="outline"
          size="small"
          style={styles.editButton}
        >
          Edit
        </Button>
      </View>

      {currentPlan ? (
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <ThemedText variant="subtitle" style={styles.planName} color="#666666">{currentPlan.name}</ThemedText>
            <ThemedText style={styles.planPrice}>
              {formatPrice(currentPlan.price, currentPlan.interval)}
            </ThemedText>
          </View>
          
          <ThemedText variant="caption" style={styles.planDescription}>{currentPlan.description}</ThemedText>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '600',
  },
  editButton: {
    borderRadius: 30,
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontWeight: '600',
    color: '#666666',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  planDescription: {
    color: '#666666',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginBottom: 16,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#333333',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  emptyIconContainer: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    marginTop: 8,
  },
}); 