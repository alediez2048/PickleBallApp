import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Text,
  Platform,
} from 'react-native';
import { TextInput } from './TextInput';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { withMemo } from '@/components/hoc/withMemo';

// We're using the built-in DateTimePicker from expo
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  editable?: boolean;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

function DatePickerComponent({
  label,
  value,
  onChangeText,
  error,
  helperText,
  editable = true,
  placeholder = '',
  maximumDate,
  minimumDate,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  
  // Parse the string date value to a Date object
  const dateValue = value ? new Date(value) : new Date();
  
  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      // Format the date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onChangeText(formattedDate);
    }
  };

  const openPicker = () => {
    if (editable) {
      setShowPicker(true);
    }
  };

  const showDatePicker = () => {
    if (Platform.OS === 'ios') {
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
                <Text style={styles.pickerHeaderTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.pickerHeaderText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      );
    }

    if (showPicker) {
      return (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={openPicker} disabled={!editable}>
        <TextInput
          label={label}
          value={value}
          onChangeText={onChangeText}
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          editable={false} // We disable direct text editing
          endIcon={<IconSymbol name="calendar" size={20} color="#666666" />}
          inputStyle={styles.whiteBackground} // Override the disabled gray background
        />
      </TouchableOpacity>
      {showDatePicker()}
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
    padding: 16,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerHeaderText: {
    color: '#007AFF',
    fontSize: 16,
  },
  pickerHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});

DatePickerComponent.displayName = 'DatePicker';

export const DatePicker = withMemo(DatePickerComponent); 