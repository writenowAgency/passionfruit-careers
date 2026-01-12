import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Button, Text } from 'react-native-paper';
import { StorageService, FileCategory } from '@/services/storage';
import { useAppSelector } from '@/store/hooks';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';
import { colors, spacing, borderRadius } from '@/theme';

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
  const responsive = useResponsiveStyles();

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
      const uploadResult = await StorageService.uploadFile({
        file,
        fileName: selectedFile.name,
        category,
        userId: String(userId),
        contentType: file.mimeType,
      });

      if (uploadResult.success) {
        setUploadProgress('Upload complete!');
        onUploadComplete?.(uploadResult.fileUrl, uploadResult.key);
        setTimeout(() => setUploadProgress(''), 2000);
      } else {
        onError?.(uploadResult.error || 'Upload failed');
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
    <View style={[styles.container, { padding: responsive.padding(spacing.md) }]}>
      <Text variant="bodyMedium" style={styles.label}>
        {label}
      </Text>
      {uploadProgress ? (
        <View style={[styles.progressContainer, { gap: responsive.spacing(spacing.sm) }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text variant="bodySmall">{uploadProgress}</Text>
        </View>
      ) : (
        <Button
          mode="contained-tonal"
          onPress={handlePick}
          disabled={uploading}
          buttonColor={colors.primary}
          textColor={colors.text}
        >
          {uploading ? 'Uploading...' : 'Choose file'}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    borderColor: colors.primary,
  },
  label: {
    marginBottom: spacing.sm,
  },
  progressContainer: {
    alignItems: 'center',
  },
});
