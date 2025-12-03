import React from 'react';
import { Platform, Pressable } from 'react-native';
import { TextInput } from 'react-native-paper';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

interface Props {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export const DatePicker: React.FC<Props> = ({ label, value, onChange }) => {
  const showPicker = () => {
    if (Platform.OS === 'web') return;
    DateTimePickerAndroid.open({
      mode: 'date',
      value,
      onChange: (_, date) => {
        if (date) onChange(date);
      },
    });
  };

  return (
    <Pressable onPress={showPicker} accessibilityRole="button">
      <TextInput
        mode="outlined"
        label={label}
        value={value.toDateString()}
        editable={false}
        pointerEvents="none"
      />
    </Pressable>
  );
};
