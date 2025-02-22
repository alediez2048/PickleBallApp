import React, { useState } from 'react';
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
  const [form, setForm] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });

  const handleSubmit = async () => {
    // Basic validation
    if (!form.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      Alert.alert('Invalid Card Number', 'Please enter a valid 16-digit card number');
      return;
    }

    if (!form.expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      Alert.alert('Invalid Expiry Date', 'Please enter a valid date (MM/YY)');
      return;
    }

    if (!form.cvv.match(/^\d{3,4}$/)) {
      Alert.alert('Invalid CVV', 'Please enter a valid CVV');
      return;
    }

    if (!form.name.trim()) {
      Alert.alert('Invalid Name', 'Please enter the cardholder name');
      return;
    }

    setIsLoading(true);
    try {
      // Here you would typically make an API call to your payment processor
      // For now, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 1500));
      onComplete();
    } catch (error) {
      Alert.alert(
        'Payment Failed',
        'There was an error processing your payment. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
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
            <Text style={styles.title}>Add Payment Method</Text>
          </View>

          <ScrollView style={styles.formContainer}>
            <View style={styles.planSummary}>
              <Text style={styles.planName}>{selectedPlan.name}</Text>
              <Text style={styles.planPrice}>
                ${selectedPlan.price}
                {selectedPlan.interval && <Text style={styles.interval}>/{selectedPlan.interval}</Text>}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={form.cardNumber}
                onChangeText={(text) => {
                  const formatted = formatCardNumber(text);
                  if (formatted.length <= 19) { // 16 digits + 3 spaces
                    setForm(prev => ({ ...prev, cardNumber: formatted }));
                  }
                }}
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={form.expiryDate}
                  onChangeText={(text) => {
                    const formatted = formatExpiryDate(text);
                    if (formatted.length <= 5) {
                      setForm(prev => ({ ...prev, expiryDate: formatted }));
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={form.cvv}
                  onChangeText={(text) => {
                    if (text.length <= 4) {
                      setForm(prev => ({ ...prev, cvv: text.replace(/\D/g, '') }));
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={form.name}
                onChangeText={(text) => setForm(prev => ({ ...prev, name: text }))}
                autoCapitalize="words"
              />
            </View>

            <Button
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Add Payment Method'}
            </Button>
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
  formContainer: {
    padding: 20,
  },
  planSummary: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
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
  interval: {
    fontSize: 16,
    color: '#666666',
  },
  inputGroup: {
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
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
  },
}); 