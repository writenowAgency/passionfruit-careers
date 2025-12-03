import React from 'react';
import { TextInput } from 'react-native-paper';

interface Props {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
}

export const RichTextEditor: React.FC<Props> = ({ value, onChangeText, label }) => (
  <TextInput
    mode="outlined"
    label={label || 'Description'}
    value={value}
    onChangeText={onChangeText}
    multiline
    numberOfLines={5}
  />
);
