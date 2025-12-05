import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { Button, Text, ActivityIndicator, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useAppSelector } from '@/store/hooks';
import { profileApi } from '@/services/profileApi';

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
  const token = useAppSelector((state) => state.auth.token);

  // Request camera permissions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return false;
    }
    return true;
  };

  // Request media library permissions
  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library permission is required to select photos.');
      return false;
    }
    return true;
  };

  // Compress and resize image
  const processImage = async (uri: string) => {
    try {
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Resize to max width 800px
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      return manipResult.uri;
    } catch (error) {
      console.error('Image processing error:', error);
      return uri; // Return original if processing fails
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const processedUri = await processImage(result.assets[0].uri);
        setImageUri(processedUri);
        await uploadPhoto(processedUri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Pick photo from gallery
  const pickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const processedUri = await processImage(result.assets[0].uri);
        setImageUri(processedUri);
        await uploadPhoto(processedUri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Upload photo to server
  const uploadPhoto = async (uri: string) => {
    if (!token) {
      Alert.alert('Error', 'You must be logged in to upload photos');
      return;
    }

    try {
      setUploading(true);
      const response = await profileApi.uploadPhoto(token, uri);
      setImageUri(response.photoUrl);
      onPhotoUploaded(response.photoUrl);
      Alert.alert('Success', 'Profile photo uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Failed to upload photo');
      setImageUri(currentPhotoUrl || null); // Revert to previous photo
    } finally {
      setUploading(false);
    }
  };

  // Delete photo
  const deletePhoto = async () => {
    if (!token) return;

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
              await profileApi.deletePhoto(token);
              setImageUri(null);
              onPhotoDeleted();
              Alert.alert('Success', 'Profile photo deleted');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete photo');
            } finally {
              setUploading(false);
            }
          },
        },
      ]
    );
  };

  // Show photo selection options
  const showPhotoOptions = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        imageUri ? { text: 'Delete Photo', onPress: deletePhoto, style: 'destructive' } : null,
        { text: 'Cancel', style: 'cancel' },
      ].filter(Boolean) as any
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.photoContainer}>
        {imageUri ? (
          <View>
            <Image source={{ uri: imageUri }} style={styles.photo} />
            {uploading && (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            )}
            <IconButton
              icon="camera"
              size={24}
              style={styles.editButton}
              iconColor="#fff"
              containerColor="#6200ee"
              onPress={showPhotoOptions}
              disabled={uploading}
            />
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <IconButton
              icon="account"
              size={60}
              iconColor="#999"
            />
            <Text variant="bodyMedium" style={styles.placeholderText}>
              No photo
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {imageUri ? (
          <Button
            mode="outlined"
            onPress={showPhotoOptions}
            disabled={uploading}
            style={styles.button}
          >
            Change Photo
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={showPhotoOptions}
            disabled={uploading}
            style={styles.button}
          >
            Add Photo
          </Button>
        )}
      </View>

      {uploading && (
        <View style={styles.uploadingText}>
          <Text variant="bodySmall">Uploading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  photoContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    marginBottom: 16,
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
  },
  placeholderText: {
    color: '#999',
    marginTop: 8,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginBottom: 8,
  },
  uploadingText: {
    marginTop: 8,
  },
});

export default PhotoUpload;
