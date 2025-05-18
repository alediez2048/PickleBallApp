import React from "react";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@/contexts/ThemeContext";
import { StyleSheet, View, Platform } from "react-native";

export function ThemedPicker({
  selectedValue,
  onValueChange,
  children,
  style,
  ...props
}: React.ComponentProps<typeof Picker>) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[
          { color: colors.text, backgroundColor: colors.background },
          style,
        ]}
        dropdownIconColor={colors.text}
        {...props}
      >
        {children}
      </Picker>
    </View>
  );
}

ThemedPicker.Item = Picker.Item;

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    height: "auto",
    marginBottom: 8,
    ...Platform.select({
      android: { overflow: "hidden" },
    }),
  },
});
