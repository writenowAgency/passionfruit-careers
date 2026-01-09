import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { Avatar, ActivityIndicator } from 'react-native-paper';
import { colors } from '@/theme';

export type ProfileImageSize = 'small' | 'medium' | 'large' | 'xlarge';
export type ProfileImageShape = 'circle' | 'square' | 'rounded';

interface ProfileImageProps {
  imageUrl?: string | null;
  userName: string;
  size?: ProfileImageSize;
  shape?: ProfileImageShape;
  loading?: boolean;
  style?: ViewStyle;
}

const SIZE_MAP: Record<ProfileImageSize, number> = {
  small: 40,
  medium: 64,
  large: 96,
  xlarge: 120,
};

const BORDER_RADIUS_MAP: Record<ProfileImageShape, number> = {
  circle: 9999, // Very large to ensure circle
  square: 0,
  rounded: 8,
};

/**
 * Universal ProfileImage Component
 *
 * Handles all image display scenarios with graceful fallbacks:
 * 1. Loading state - Shows spinner
 * 2. Valid image URL - Shows image
 * 3. Invalid/broken URL - Falls back to initials
 * 4. No URL - Shows initials
 *
 * Works across all platforms (web, iOS, Android)
 * Works for all user types (job seekers, employers, admins)
 */
const ProfileImage: React.FC<ProfileImageProps> = ({
  imageUrl,
  userName,
  size = 'medium',
  shape = 'circle',
  loading = false,
  style,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const avatarSize = SIZE_MAP[size];
  const borderRadius = BORDER_RADIUS_MAP[shape];

  // Reset error state when imageUrl changes
  useEffect(() => {
    setImageError(false);
    if (imageUrl) {
      setImageLoading(true);
    }
  }, [imageUrl]);

  // Generate initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(userName);

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius,
          },
          style,
        ]}
      >
        <View style={[styles.loadingContainer, { borderRadius }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </View>
    );
  }

  // Show initials if no image or image failed to load
  if (!imageUrl || imageError) {
    return (
      <Avatar.Text
        size={avatarSize}
        label={initials}
        style={[
          styles.avatar,
          {
            borderRadius,
            backgroundColor: colors.primary,
          },
          style,
        ]}
        labelStyle={[
          styles.initialsText,
          {
            fontSize: avatarSize * 0.4, // Scale font with avatar size
          },
        ]}
      />
    );
  }

  // Platform-specific image rendering for best compatibility
  if (Platform.OS === 'web') {
    return (
      <View
        style={[
          styles.container,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius,
          },
          style,
        ]}
      >
        <img
          src={imageUrl}
          alt={`${userName}'s profile`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius,
          }}
          onLoad={() => {
            console.log(`[ProfileImage] Image loaded: ${imageUrl}`);
            setImageLoading(false);
          }}
          onError={(e) => {
            console.error(`[ProfileImage] Image failed to load:`, imageUrl, e);
            setImageError(true);
            setImageLoading(false);
          }}
        />
        {imageLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </View>
    );
  }

  // Native platform (iOS/Android) - use Avatar.Image
  return (
    <View style={[{ width: avatarSize, height: avatarSize }, style]}>
      <Avatar.Image
        size={avatarSize}
        source={{ uri: imageUrl }}
        style={{ borderRadius }}
        onError={() => {
          console.error(`[ProfileImage] Native image failed to load:`, imageUrl);
          setImageError(true);
          setImageLoading(false);
        }}
        onLoad={() => {
          console.log(`[ProfileImage] Native image loaded: ${imageUrl}`);
          setImageLoading(false);
        }}
      />
      {imageLoading && (
        <View style={[styles.loadingOverlay, { borderRadius }]}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  initialsText: {
    color: '#fff',
    fontWeight: '700',
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileImage;
