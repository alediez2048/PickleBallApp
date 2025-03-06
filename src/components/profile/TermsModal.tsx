import React from 'react';
import {
  View,
  ScrollView,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ThemedText } from '@components/ThemedText';
import { IconSymbol } from '@components/ui/IconSymbol';
import { Button } from '@components/common/ui/Button';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  type: 'terms' | 'privacy' | 'waiver';
  isLoading?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  visible,
  onClose,
  onAccept,
  type,
  isLoading,
}) => {
  const getTitle = () => {
    switch (type) {
      case 'terms':
        return 'Terms & Conditions';
      case 'privacy':
        return 'Privacy Policy';
      case 'waiver':
        return 'Liability Waiver';
    }
  };

  const getContent = () => {
    switch (type) {
      case 'terms':
        return `By accepting these Terms & Conditions, you agree to:

1. Follow all rules and guidelines set by PicklePass
2. Respect other players and court facilities
3. Maintain accurate profile information
4. Accept game scheduling and cancellation policies
5. Comply with our fair play standards

These terms are subject to change. You will be notified of any updates.`;
      case 'privacy':
        return `Our Privacy Policy outlines how we collect, use, and protect your data:

1. We collect profile information you provide
2. Location data is used for game matching
3. Your playing history is stored securely
4. Contact information is used for notifications
5. We never share your data with third parties
6. You can request data deletion at any time

Your privacy is important to us.`;
      case 'waiver':
        return `By accepting this Liability Waiver, you acknowledge:

1. Pickleball involves inherent risks of injury
2. You are physically fit to participate
3. You will follow safety guidelines
4. You release PicklePass from liability
5. You have health insurance coverage
6. You accept responsibility for your actions

This is a legally binding agreement.`;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText variant="title" style={styles.modalTitle}>
              {getTitle()}
            </ThemedText>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              disabled={isLoading}
            >
              <IconSymbol
                name="xmark"
                size={24}
                color={isLoading ? '#999999' : '#666666'}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll}>
            <ThemedText variant="body" style={styles.content} color="#666666">
              {getContent()}
            </ThemedText>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              variant="secondary"
              size="medium"
              onPress={onClose}
              disabled={isLoading}
              style={styles.footerButton}
            >
              Decline
            </Button>
            <Button
              variant="primary"
              size="medium"
              onPress={onAccept}
              loading={isLoading}
              disabled={isLoading}
              style={styles.footerButton}
            >
              Accept
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  closeButton: {
    padding: 8,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  contentScroll: {
    padding: 16,
    maxHeight: 400,
  },
  content: {
    lineHeight: 24,
    color: '#666666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
}); 