import React, { useState, useRef } from 'react';
import { View, StyleSheet, Platform, Alert, Pressable } from 'react-native';
import { Button, Text, IconButton, ProgressBar } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { API_CONFIG } from '@/config/api';
import { colors, spacing, borderRadius } from '@/theme';
import ProfileImage, { ProfileImageSize } from './ProfileImage';

export type UserType = 'job_seeker' | 'employer';

interface PhotoUploadWidgetProps {
  currentPhotoUrl?: string | null;
  userName: string;
  userType: UserType;
  token: string;
  size?: ProfileImageSize;
  maxSizeMB?: number;
  allowedFormats?: string[];
  onUploadSuccess: (photoUrl: string) => void;
  onUploadError: (error: Error) => void;
  onDeleteSuccess?: () => void;
  showButtons?: boolean;
}

/**
 * Universal PhotoUploadWidget Component
 *
 * Handles photo upload/delete for all user types with:
 * - File validation (type, size)
 * - Image optimization/compression
 * - Upload progress tracking
 * - Platform-specific file selection
 * - Graceful error handling
 * - Automatic state management
 *
 * Works for: Job Seekers, Employers, Admins
 * Works on: Web, iOS, Android
 */
const PhotoUploadWidget: React.FC<PhotoUploadWidgetProps> = ({
  currentPhotoUrl,
  userName,
  userType,
  token,
  size = 'xlarge',
  maxSizeMB = 5,
  allowedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  onUploadSuccess,
  onUploadError,
  onDeleteSuccess,
  showButtons = true,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop changes
  React.useEffect(() => {
    setPhotoUrl(currentPhotoUrl || null);
  }, [currentPhotoUrl]);

  /**
   * Optimize/compress image before upload
   */
  const optimizeImage = async (uri: string): Promise<string> => {
    try {
      console.log('[PhotoUploadWidget] Optimizing image...');
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Resize to max 800px width
        { compress: 0.8, format: SaveFormat.JPEG }
      );
      console.log('[PhotoUploadWidget] Image optimized');
      return manipResult.uri;
    } catch (error) {
      console.error('[PhotoUploadWidget] Optimization failed, using original:', error);
      return uri; // Fall back to original if optimization fails
    }
  };

  /**
   * Validate file before upload
   */
  const validateFile = (file: File | Blob): { valid: boolean; error?: string } => {
    // Check file type
    if (!allowedFormats.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${allowedFormats.join(', ')}`,
      };
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSizeMB}MB`,
      };
    }

    return { valid: true };
  };

  /**
   * Upload photo to backend
   */
  const uploadPhoto = async (file: File | Blob, fileName: string) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      console.log(`[PhotoUploadWidget] Uploading ${fileName} for ${userType}...`);

      // Create FormData
      const formData = new FormData();
      formData.append('photo', file, fileName);

      // Determine API endpoint based on user type
      const endpoint = `${API_CONFIG.BASE_URL}/profile/photo`;

      // Upload with progress tracking (simulated for now)
      setUploadProgress(30);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      setUploadProgress(70);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setUploadProgress(100);

      console.log('[PhotoUploadWidget] Upload successful:', data.photoUrl);

      // Update local state
      setPhotoUrl(data.photoUrl);

      // Notify parent
      onUploadSuccess(data.photoUrl);

      // Show success message
      if (Platform.OS === 'web') {
        Alert.alert('Success', 'Profile photo uploaded successfully!');
      }
    } catch (error) {
      console.error('[PhotoUploadWidget] Upload error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      // Notify parent
      onUploadError(error instanceof Error ? error : new Error(errorMessage));

      // Show error message
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Handle web file selection
   */
  const handleWebFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPhotoUrl(previewUrl);

    // Upload file
    await uploadPhoto(file, file.name);
  };

  /**
   * Handle native image picker (iOS/Android)
   */
  const handleNativeImagePick = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library access is required to select photos.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const imageUri = result.assets[0].uri;

      // Optimize image
      const optimizedUri = await optimizeImage(imageUri);

      // Convert to blob
      const response = await fetch(optimizedUri);
      const blob = await response.blob();

      const fileName = `profile-photo-${Date.now()}.jpg`;

      // Upload
      await uploadPhoto(blob, fileName);
    } catch (error) {
      console.error('[PhotoUploadWidget] Native picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  /**
   * Handle photo selection (platform-specific)
   */
  const handleSelectPhoto = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      handleNativeImagePick();
    }
  };

  /**
   * Delete photo
   */
  const handleDeletePhoto = async () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete your profile photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);

              const endpoint = `${API_CONFIG.BASE_URL}/profile/photo`;

              const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Failed to delete photo');
              }

              console.log('[PhotoUploadWidget] Photo deleted');

              // Update local state
              setPhotoUrl(null);

              // Notify parent
              if (onDeleteSuccess) {
                onDeleteSuccess();
              }

              Alert.alert('Success', 'Profile photo deleted');
            } catch (error) {
              console.error('[PhotoUploadWidget] Delete error:', error);
              Alert.alert('Error', 'Failed to delete photo');
            } finally {
              setUploading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Hidden file input for web */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedFormats.join(',')}
          style={{ display: 'none' }}
          onChange={handleWebFileSelect}
        />
      )}

      {/* Profile Image with Edit Icon */}
      <View style={styles.imageContainer}>
        <Pressable
          onPress={showButtons ? handleSelectPhoto : undefined}
          disabled={uploading}
        >
          <ProfileImage
            imageUrl={photoUrl}
            userName={userName}
            size={size}
            loading={uploading}
          />

          {/* Edit Icon Overlay */}
          {showButtons && !uploading && (
            <View style={styles.editIconContainer}>
              <IconButton
                icon="camera"
                size={20}
                iconColor="#fff"
                containerColor={colors.primary}
                onPress={handleSelectPhoto}
              />
            </View>
          )}
        </Pressable>
      </View>

      {/* Upload Progress */}
      {uploading && uploadProgress > 0 && (
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={uploadProgress / 100}
            color={colors.primary}
            style={styles.progressBar}
          />
          <Text variant="bodySmall" style={styles.progressText}>
            Uploading... {uploadProgress}%
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {showButtons && !uploading && (
        <View style={styles.buttonsContainer}>
          {photoUrl ? (
            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={handleSelectPhoto}
                style={styles.button}
                icon="camera"
                textColor={colors.primary}
              >
                Change
              </Button>
              <Button
                mode="outlined"
                onPress={handleDeletePhoto}
                style={styles.button}
                icon="delete"
                textColor={colors.error}
              >
                Delete
              </Button>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={handleSelectPhoto}
              style={styles.button}
              icon="camera-plus"
              buttonColor={colors.primary}
            >
              Add Photo
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'center',
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 300,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});

export default PhotoUploadWidget;
