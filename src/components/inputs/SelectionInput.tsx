import React from 'react';
import {TextInput, TouchableRipple} from 'react-native-paper';

interface ISelectionInputProps {
  label: string;
  value?: string;
  onPress: () => void;
  error?: boolean;
}

export default function SelectionInput({
  label,
  value,
  onPress,
  error,
}: ISelectionInputProps) {
  return (
    <TouchableRipple onPress={onPress} pointerEvents="box-only">
      <TextInput
        label={label}
        value={value}
        error={error}
        right={<TextInput.Icon icon={'chevron-down'} size={32} />}
      />
    </TouchableRipple>
  );
}
