import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Button } from '@/components/common/ui/Button';
import { PaymentMethodModal } from '@/components/payment/PaymentMethodModal';

interface PaymentMethod {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethod[];
  onUpdatePaymentMethods: (methods: PaymentMethod[]) => void;
}

export function PaymentMethodsSection({
  paymentMethods = [],
  onUpdatePaymentMethods,
}: PaymentMethodsSectionProps) {
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  const handleAddPayment = () => {
    setShowAddPaymentModal(true);
  };

  const handlePaymentComplete = () => {
    setShowAddPaymentModal(false);
    // In a real app, you would update the payment methods from your backend
    // For now, we'll simulate adding a new payment method
    const newPaymentMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      last4: '4242',
      brand: 'Visa',
      expiryMonth: '12',
      expiryYear: '25',
      isDefault: paymentMethods.length === 0,
    };
    onUpdatePaymentMethods([...paymentMethods, newPaymentMethod]);
  };

  const handleSetDefault = (methodId: string) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === methodId,
    }));
    onUpdatePaymentMethods(updatedMethods);
  };

  const handleRemove = (methodId: string) => {
    const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
    onUpdatePaymentMethods(updatedMethods);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Methods</Text>
        <Button
          onPress={handleAddPayment}
          style={styles.addButton}
          variant="secondary"
        >
          Add New
        </Button>
      </View>

      {paymentMethods.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="creditcard.fill" size={24} color="#666666" />
          <Text style={styles.emptyText}>No payment methods added</Text>
          <Text style={styles.emptySubtext}>
            Add a payment method to easily book games
          </Text>
        </View>
      ) : (
        <View style={styles.cardList}>
          {paymentMethods.map((method) => (
            <View key={method.id} style={styles.card}>
              <View style={styles.cardInfo}>
                <View style={styles.cardBrand}>
                  <IconSymbol
                    name="creditcard.fill"
                    size={24}
                    color="#000000"
                  />
                  <Text style={styles.cardBrandText}>{method.brand}</Text>
                </View>
                <Text style={styles.cardNumber}>•••• {method.last4}</Text>
                <Text style={styles.cardExpiry}>
                  Expires {method.expiryMonth}/{method.expiryYear}
                </Text>
              </View>
              <View style={styles.cardActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    onPress={() => handleSetDefault(method.id)}
                    style={styles.actionButton}
                  >
                    <Text style={styles.actionButtonText}>Set Default</Text>
                  </TouchableOpacity>
                )}
                {method.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => handleRemove(method.id)}
                  style={[styles.actionButton, styles.removeButton]}
                >
                  <IconSymbol name="xmark" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <PaymentMethodModal
        visible={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onComplete={handlePaymentComplete}
        selectedPlan={{
          id: 'update',
          name: 'Update Payment Method',
          price: 0,
          benefits: [],
          description: 'Add a new payment method'
        }}
      />
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
  addButton: {
    paddingHorizontal: 16,
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
  },
  cardList: {
    gap: 12,
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  cardInfo: {
    marginBottom: 12,
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBrandText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
    color: '#000000',
  },
  cardNumber: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 14,
    color: '#666666',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500',
  },
}); 