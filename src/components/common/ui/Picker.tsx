import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Text,
  Platform,
} from 'react-native';
import { TextInput } from './TextInput';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { withMemo } from '@/components/hoc/withMemo';

interface PickerItem {
  label: string;
  value: string;
}

interface PickerProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  error?: string;
  helperText?: string;
  editable?: boolean;
  placeholder?: string;
}

function PickerComponent({
  label,
  value,
  onValueChange,
  items,
  error,
  helperText,
  editable = true,
  placeholder = '',
}: PickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  const selectedItem = items.find(item => item.value === value);
  const displayValue = selectedItem ? selectedItem.label : '';
  
  const openPicker = () => {
    if (editable) {
      setShowPicker(true);
    }
  };

  const handleSelect = (item: PickerItem) => {
    onValueChange(item.value);
    setShowPicker(false);
  };

  const renderPickerItems = () => {
    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={showPicker}
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.pickerHeaderText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.pickerHeaderTitle}>{label || 'Select'}</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.pickerHeaderText}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    item.value === value && styles.selectedPickerItem,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      item.value === value && styles.selectedPickerItemText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <IconSymbol
                      name="checkmark"
                      size={20}
                      color="#4CAF50"
                    />
                  )}
                </TouchableOpacity>
              )}
              style={styles.pickerList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openPicker} disabled={!editable}>
        <TextInput
          label={label}
          value={displayValue}
          onChangeText={() => {}} // This is disabled, so no text changes
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          editable={false} // We disable direct text editing
          endIcon={<IconSymbol name="chevron.down" size={20} color="#666666" />}
          inputStyle={styles.whiteBackground} // Override the disabled gray background
        />
      </TouchableOpacity>
      {showPicker && renderPickerItems()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  whiteBackground: {
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pickerHeaderText: {
    color: '#007AFF',
    fontSize: 16,
  },
  pickerHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerList: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 0, // Extra padding for iOS home indicator
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedPickerItem: {
    backgroundColor: '#F1F8E9',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedPickerItemText: {
    fontWeight: '600',
    color: '#4CAF50',
  },
});

PickerComponent.displayName = 'Picker';

export const Picker = withMemo(PickerComponent); 