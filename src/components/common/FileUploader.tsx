import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Button, Text } from 'react-native-paper';
import { StorageService, FileCategory } from '@/services/storage';
import { useAppSelector } from '@/store/hooks';

interface Props {
  onUploadComplete?: (fileUrl: string, key: string) => void;
  onError?: (error: string) => void;
  label?: string;
  category: FileCategory;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

export const FileUploader: React.FC<Props> = ({
  onUploadComplete,
  onError,
  label = 'Upload file',
  category,
  maxSizeMB,
  allowedTypes,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const userId = useAppSelector((state) => state.auth.user?.id || 'guest');

  const handlePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled || !result.assets?.length) return;

      const selectedFile = result.assets[0];
      setUploadProgress('Validating file...');

      // Convert DocumentPicker asset to File/Blob
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();
      const file = new File([blob], selectedFile.name, { type: selectedFile.mimeType || 'application/octet-stream' });

      // Validate file size
      const validationRules = StorageService.FILE_VALIDATION_RULES[category];
      const maxSize = maxSizeMB || validationRules.maxSizeMB;
      if (!StorageService.validateFileSize(file, maxSize)) {
        const error = `File size exceeds ${maxSize}MB limit`;
        onError?.(error);
        setUploadProgress('');
        return;
      }

      // Validate file type
      const types = allowedTypes || validationRules.allowedTypes;
      if (!StorageService.validateFileType(file, types)) {
        const error = `Invalid file type. Allowed: ${types.join(', ')}`;
        onError?.(error);
        setUploadProgress('');
        return;
      }

      setUploading(true);
      setUploadProgress('Uploading to cloud...');

      // Upload to R2
      const result = await StorageService.uploadFile({
        file,
        fileName: selectedFile.name,
        category,
        userId,
        contentType: selectedFile.mimeType || undefined,
      });

      if (result.success) {
        setUploadProgress('Upload complete!');
        onUploadComplete?.(result.fileUrl, result.key);
        setTimeout(() => setUploadProgress(''), 2000);
      } else {
        onError?.(result.error || 'Upload failed');
        setUploadProgress('');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ padding: 16, borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, borderColor: '#F4E04D' }}>
      <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
        {label}
      </Text>
      {uploadProgress ? (
        <View style={{ alignItems: 'center', gap: 8 }}>
          <ActivityIndicator size="small" color="#F4E04D" />
          <Text variant="bodySmall">{uploadProgress}</Text>
        </View>
      ) : (
        <Button
          mode="contained-tonal"
          onPress={handlePick}
          disabled={uploading}
          buttonColor="#F4E04D"
          textColor="#2E2E2E"
        >
          {uploading ? 'Uploading...' : 'Choose file'}
        </Button>
      )}
    </View>
  );
};
