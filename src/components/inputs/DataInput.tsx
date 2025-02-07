import React, {useState} from 'react';
import {TextInput, TouchableRipple} from 'react-native-paper';
import DatePicker from 'react-native-date-picker';

interface ISelectionInputProps {
  label: string;
  value?: Date;
  onPress: () => void;
  error?: boolean;
  isVisible: boolean;
  onDateConfirm: (date: Date) => void;
  onCancel: () => void;
}

const formatDate = (date?: Date) => {
  if (!date) return 'DD/MM/YYYY';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const DateInput: React.FC<ISelectionInputProps> = ({
  label,
  value,
  onPress,
  error,
  isVisible,
  onDateConfirm,
  onCancel,
}) => {
  return (
    <>
      <TouchableRipple onPress={onPress} pointerEvents="box-only">
        <TextInput
          label={label}
          value={formatDate(value)}
          error={error}
          right={<TextInput.Icon icon={'chevron-down'} size={32} />}
        />
      </TouchableRipple>
      <DatePicker
        modal
        mode="date"
        open={isVisible}
        date={value || new Date()}
        onConfirm={onDateConfirm}
        onCancel={onCancel}
      />
    </>
  );
};
