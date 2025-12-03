import React from 'react';
import { View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Button, Text } from 'react-native-paper';

interface Props {
  onPick: (file: DocumentPicker.DocumentPickerAsset) => void;
  label?: string;
}

export const FileUploader: React.FC<Props> = ({ onPick, label = 'Upload file' }) => {
  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.canceled || !result.assets?.length) return;
    onPick(result.assets[0]);
  };

  return (
    <View style={{ padding: 16, borderWidth: 1, borderStyle: 'dashed', borderRadius: 16 }}>
      <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
        {label}
      </Text>
      <Button mode="contained-tonal" onPress={handlePick}>
        Choose file
      </Button>
    </View>
  );
};
