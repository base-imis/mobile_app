import React from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import colors from "../../core/theme/colors";

// Native picker that keeps its field name visible. With only a placeholder
// item, the name disappeared once a value was selected (QA, v1.0.3), unlike
// text inputs and SearchableDropdown. Matches SearchableDropdown's look.
//
// Values are compared as strings on both sides so a numeric value from the
// server still matches its option.
const LabeledPicker = ({
  label,
  placeholder,
  options = [],
  value,
  onChange,
  disabled = false,
  error = false,
}) => {
  const theme = useTheme();
  const selected = value === undefined || value === null ? "" : String(value);

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: error ? theme.colors.error : colors.darkGrey,
          borderBottomWidth: error ? 2 : 0.6,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      <Picker
        style={styles.picker}
        selectedValue={selected}
        onValueChange={onChange}
        enabled={!disabled}
        accessibilityLabel={label}
      >
        <Picker.Item label={placeholder} value="" color="#767A7D" />
        {options.map((opt) => (
          <Picker.Item
            key={String(opt.value)}
            label={opt.label}
            value={String(opt.value)}
          />
        ))}
      </Picker>
      {/* Rendered after the native Picker so it draws on top of it */}
      {!!label && (
        <Text style={styles.floatingLabel} numberOfLines={1} pointerEvents="none">
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.fieldsColor,
    paddingTop: 14,
  },
  picker: {
    color: "#1C1B1F",
  },
  floatingLabel: {
    position: "absolute",
    top: 4,
    left: 16,
    right: 48,
    fontSize: 11,
    color: "#767A7D",
  },
});

export default LabeledPicker;
