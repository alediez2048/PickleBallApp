import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Button } from '@/components/common/ui/Button';

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  interval?: 'month' | 'year';
  benefits: string[];
  description: string;
}

const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'drop-in',
    name: 'Drop-In Pass',
    price: 10,
    description: 'Perfect for occasional players',
    benefits: [
      'Single game access',
      'No commitment required',
      'Full access to game features',
      'Cancel anytime',
    ],
  },
  {
    id: 'monthly',
    name: 'Monthly Membership',
    price: 50,
    interval: 'month',
    description: 'Best value for regular players',
    benefits: [
      'Unlimited game access',
      'Priority booking',
      'Member-only events',
      'Exclusive discounts',
      'Cancel anytime',
    ],
  },
];

interface MembershipPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: MembershipPlan) => void;
}

export function MembershipPlanModal({
  visible,
  onClose,
  onSelectPlan,
}: MembershipPlanModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconSymbol name="xmark" size={24} color="#666666" />
            </TouchableOpacity>
            <Text style={styles.title}>Choose Your Plan</Text>
            <Text style={styles.subtitle}>
              Select a membership plan to start playing
            </Text>
          </View>

          <ScrollView style={styles.plansContainer}>
            {MEMBERSHIP_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.planCard}
                onPress={() => onSelectPlan(plan)}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>${plan.price}</Text>
                    {plan.interval && (
                      <Text style={styles.interval}>/{plan.interval}</Text>
                    )}
                  </View>
                </View>

                <Text style={styles.planDescription}>{plan.description}</Text>

                <View style={styles.benefitsContainer}>
                  {plan.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                      <IconSymbol
                        name="checkmark"
                        size={20}
                        color="#4CAF50"
                      />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>

                <Button
                  onPress={() => onSelectPlan(plan)}
                  style={styles.selectButton}
                >
                  Select {plan.name}
                </Button>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 60,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  plansContainer: {
    padding: 20,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  interval: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333333',
  },
  selectButton: {
    width: '100%',
  },
}); 