import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Button } from '@/components/common/ui/Button';
import { MembershipPlan } from '@/types/membership';

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  selectedPlan: MembershipPlan;
}

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

export function PaymentMethodModal({
  visible,
  onClose,
  onComplete,
  selectedPlan,
}: PaymentMethodModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });

  // Reset form and success state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setIsSuccess(false);
      setForm({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        name: '',
      });
    }
  }, [visible]);

  const handleSubmit = async () => {
    // Basic validation
    if (!form.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      Alert.alert('Invalid Card Number', 'Please enter a valid 16-digit card number');
      return;
    }

    if (!form.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      Alert.alert('Invalid Expiry Date', 'Please enter a valid expiry date (MM/YY)');
      return;
    }

    if (!form.cvv.match(/^\d{3,4}$/)) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV code');
      return;
    }

    if (form.name.trim().length < 3) {
      Alert.alert('Invalid Name', 'Please enter the name on your card');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      // Show success message and close after a delay
      setTimeout(() => {
        onComplete();
      }, 1500);
    }, 1500);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setForm(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryDateChange = (text: string) => {
    // Format as MM/YY
    const cleaned = text.replace(/[^\d]/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 2) {
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    
    setForm(prev => ({ ...prev, expiryDate: formatted }));
  };

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
            <Text style={styles.title}>Payment Method</Text>
            <Text style={styles.subtitle}>
              {isSuccess 
                ? 'Payment method added successfully!' 
                : `Add a payment method for ${selectedPlan.name}`}
            </Text>
          </View>

          {isSuccess ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <IconSymbol name="checkmark" size={40} color="#FFFFFF" />
              </View>
              <Text style={styles.successText}>Payment Method Added</Text>
              <Text style={styles.successSubtext}>
                Your subscription to {selectedPlan.name} has been activated.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.formContainer}>
              <View style={styles.planSummary}>
                <Text style={styles.planSummaryTitle}>Plan Summary</Text>
                <View style={styles.planDetails}>
                  <Text style={styles.planName}>{selectedPlan.name}</Text>
                  <Text style={styles.planPrice}>
                    ${selectedPlan.price}{selectedPlan.interval ? `/${selectedPlan.interval}` : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="number-pad"
                  value={form.cardNumber}
                  onChangeText={handleCardNumberChange}
                  maxLength={19} // 16 digits + 3 spaces
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.label}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    keyboardType="number-pad"
                    value={form.expiryDate}
                    onChangeText={handleExpiryDateChange}
                    maxLength={5} // MM/YY
                  />
                </View>

                <View style={[styles.formGroup, styles.formGroupHalf]}>
                  <Text style={styles.label}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    keyboardType="number-pad"
                    value={form.cvv}
                    onChangeText={(text) => setForm(prev => ({ ...prev, cvv: text }))}
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Name on Card</Text>
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  value={form.name}
                  onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
                />
              </View>

              <Button
                onPress={handleSubmit}
                variant="primary"
                style={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Add Payment Method'}
              </Button>
            </ScrollView>
          )}
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
  formContainer: {
    padding: 20,
  },
  planSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  planSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333333',
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  submitButton: {
    marginTop: 24,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
}); 