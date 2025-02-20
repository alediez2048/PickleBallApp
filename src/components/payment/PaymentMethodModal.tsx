import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { PaymentMethodForm } from './PaymentMethodForm';

interface PaymentMethodModalProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
  isFirstTime?: boolean;
}

export function PaymentMethodModal({
  isVisible,
  onClose,
  onComplete,
  isFirstTime = false,
}: PaymentMethodModalProps) {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <PaymentMethodForm
            onCancel={onClose}
            onComplete={onComplete}
            isFirstTime={isFirstTime}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },
}); 