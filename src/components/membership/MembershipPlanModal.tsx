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
  currentPlanId?: string;
}

export function MembershipPlanModal({
  visible,
  onClose,
  onSelectPlan,
  currentPlanId,
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
              Select a membership plan that fits your needs
            </Text>
          </View>

          <ScrollView style={styles.plansContainer}>
            {MEMBERSHIP_PLANS.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  currentPlanId === plan.id && styles.currentPlanCard
                ]}
                onPress={() => onSelectPlan(plan)}
              >
                {currentPlanId === plan.id && (
                  <View style={styles.currentPlanBadge}>
                    <Text style={styles.currentPlanBadgeText}>Current Plan</Text>
                  </View>
                )}
                
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
                      <IconSymbol name="checkmark" size={16} color="#4CAF50" style={styles.benefitIcon} />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>

                <Button
                  variant={currentPlanId === plan.id ? "outline" : "primary"}
                  style={styles.selectButton}
                  onPress={() => onSelectPlan(plan)}
                >
                  {currentPlanId === plan.id ? 'Current Plan' : 'Select Plan'}
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
    marginTop: Platform.OS === 'ios' ? 50 : 20,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
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
    marginBottom: 8,
    color: '#333333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  plansContainer: {
    padding: 20,
  },
  planCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentPlanCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#F1F8E9',
  },
  currentPlanBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    position: 'absolute',
    top: -12,
    right: 20,
    zIndex: 1,
  },
  currentPlanBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  interval: {
    fontSize: 16,
    color: '#666666',
  },
  planDescription: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 22,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitIcon: {
    marginRight: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  selectButton: {
    width: '100%',
  },
}); 