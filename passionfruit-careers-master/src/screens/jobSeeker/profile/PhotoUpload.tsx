import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Alert, Pressable } from 'react-native';
import { Button, Text, ActivityIndicator, IconButton, Portal, Dialog, Paragraph } from 'react-native-paper';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useAppSelector } from '@/store/hooks';
import { profileApi } from '@/services/profileApi';
import { API_CONFIG } from '@/config/api';
import { colors, spacing, borderRadius } from '@/theme';

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoUploaded: (photoUrl: string) => void;
  onPhotoDeleted: () => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoUploaded,
  onPhotoDeleted,
}) => {
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(currentPhotoUrl || null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const auth = useAppSelector((state) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync imageUri with currentPhotoUrl prop when it changes
  useEffect(() => {
    console.log('[PhotoUpload] currentPhotoUrl changed:', currentPhotoUrl);
    setImageUri(currentPhotoUrl || null);
  }, [currentPhotoUrl]);

  const processImage = async (uri: string) => {
    try {
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Image processing error:', error);
      return uri;
    }
  };

  const handleUpload = async (file: File | Blob, fileName: string) => {
    if (!auth.token || !auth.user) {
      Alert.alert('Error', 'You must be logged in to upload photos');
      return;
    }

    setUploading(true);

    try {
      // Upload via backend API (backend handles R2 upload securely)
      const formData = new FormData();
      formData.append('photo', file, fileName);

      const response = await fetch(`${API_CONFIG.BASE_URL}/profile/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload photo');
      }

      console.log('[PhotoUpload] Upload successful, new photo URL:', data.photoUrl);
      setImageUri(data.photoUrl);
      onPhotoUploaded(data.photoUrl);
      Alert.alert('Success', 'Profile photo uploaded successfully!');

    } catch (error) {
      console.error('Upload process error:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'An unknown error occurred');
      setImageUri(currentPhotoUrl || null); // Revert on failure
    } finally {
      setUploading(false);
    }
  };

  // Web file selection
  const handleWebFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      Alert.alert('Invalid File Type', `Please select a valid image file (${allowedTypes.join(', ')})`);
      return;
    }

    // Validate file size (max 5MB)
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        Alert.alert('File Too Large', `Please select an image smaller than ${maxSizeMB}MB`);
        return;
    }

    setImageUri(URL.createObjectURL(file));
    await handleUpload(file, file.name);
  };

  // Native image picking
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library permission is required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const processedUri = await processImage(result.assets[0].uri);
        setImageUri(processedUri);
        
        // Convert URI to blob
        const response = await fetch(processedUri);
        const blob = await response.blob();
        const filename = processedUri.split('/').pop() || 'photo.jpg';

        await handleUpload(blob, filename);

      } catch (error) {
        console.error('Image processing/upload error:', error);
        Alert.alert('Error', 'Failed to process image');
      }
    }
  };
  
  const showDeleteDialog = () => {
    if (!auth.token) return;
    setDeleteDialogVisible(true);
  };

  const confirmDeletePhoto = async () => {
    if (!auth.token) return;
    
    setDeleteDialogVisible(false);
    setUploading(true);
    
    try {
      // We should probably also delete the file from R2, but the backend handles that.
      await profileApi.deletePhoto(auth.token);
      setImageUri(null);
      onPhotoDeleted();
      Alert.alert('Success', 'Profile photo deleted');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete photo');
    } finally {
      setUploading(false);
    }
  };
  
  const handleSelectPhoto = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      pickImage();
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleWebFileSelect}
        />
      )}

      <View style={styles.photoContainer}>
        {imageUri ? (
          <Pressable onPress={handleSelectPhoto} disabled={uploading}>
            {Platform.OS === 'web' ? (
              <img
                src={imageUri}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: 75,
                }}
                onError={(e) => console.error('[PhotoUpload] Image load error:', e)}
                onLoad={() => console.log('[PhotoUpload] Image loaded successfully:', imageUri)}
              />
            ) : (
              <Image
                source={{ uri: imageUri }}
                style={styles.photo}
                contentFit="cover"
                cachePolicy="none"
                onError={(error) => console.error('[PhotoUpload] Image load error:', error)}
                onLoad={() => console.log('[PhotoUpload] Image loaded successfully:', imageUri)}
              />
            )}
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
            <View style={styles.editButton}>
              <IconButton
                icon="camera"
                size={20}
                iconColor="#fff"
                containerColor={colors.primary}
                onPress={handleSelectPhoto}
                disabled={uploading}
              />
            </View>
          </Pressable>
        ) : (
          <Pressable style={styles.placeholderContainer} onPress={handleSelectPhoto} disabled={uploading}>
            <IconButton
              icon="account"
              size={60}
              iconColor="#999"
            />
            <Text variant="bodyMedium" style={styles.placeholderText}>
              No photo
            </Text>
          </Pressable>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {imageUri ? (
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handleSelectPhoto}
              disabled={uploading}
              style={[styles.button, styles.changeButton]}
              icon="camera"
            >
              Change
            </Button>
            <Button
              mode="outlined"
              onPress={showDeleteDialog}
              disabled={uploading}
              style={[styles.button, styles.deleteButton]}
              buttonColor="#ffebee"
              textColor="#c62828"
              icon="delete"
            >
              Delete
            </Button>
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={handleSelectPhoto}
            disabled={uploading}
            style={styles.button}
            icon="camera-plus"
            buttonColor={colors.primary}
          >
            Add Photo
          </Button>
        )}
      </View>

      {uploading && (
        <View style={styles.uploadingText}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text variant="bodySmall" style={styles.uploadingLabel}>Uploading...</Text>
        </View>
      )}

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Photo</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete your profile photo?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={confirmDeletePhoto} textColor="#d32f2f">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  photoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.background,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  placeholderText: {
    color: '#999',
    marginTop: spacing.xs,
    fontSize: 13,
  },
  buttonContainer: {
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
  changeButton: {
    borderColor: colors.primary,
  },
  deleteButton: {
    borderColor: '#c62828',
  },
  uploadingText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  uploadingLabel: {
    color: colors.textSecondary,
  },
});

export default PhotoUpload;
