import React from 'react';
import { View, StyleSheet, Pressable, ColorValue } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { RecentApplicant } from '@/services/employerApi';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface ApplicantListItemProps {
  applicant: RecentApplicant;
  onPress?: () => void;
  showMatchScore?: boolean;
}

export const ApplicantListItem: React.FC<ApplicantListItemProps> = ({
  applicant,
  onPress,
  showMatchScore = true,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return colors.matchHigh;
    if (score >= 60) return colors.matchMedium;
    return colors.matchLow;
  };

  const getAvatarGradient = (score: number): readonly [ColorValue, ColorValue] => {
    if (score >= 80) return [colors.matchHigh, colors.success];
    if (score >= 60) return [colors.matchMedium, colors.secondaryDark];
    return [colors.matchLow, colors.accentDark];
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return colors.warning;
      case 'reviewed':
        return colors.info;
      case 'accepted':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            borderLeftColor: showMatchScore
              ? getMatchScoreColor(applicant.matchScore)
              : 'transparent',
          },
        ]}
      >
        <LinearGradient
          colors={getAvatarGradient(applicant.matchScore)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>
            {applicant.name.charAt(0).toUpperCase()}
          </Text>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(applicant.status) },
            ]}
          />
        </LinearGradient>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text variant="titleMedium" style={styles.name}>
              {applicant.name}
            </Text>
            {showMatchScore && (
              <View
                style={[
                  styles.matchBadge,
                  { backgroundColor: `${getMatchScoreColor(applicant.matchScore)}15` },
                ]}
              >
                <Text
                  style={[
                    styles.matchScore,
                    { color: getMatchScoreColor(applicant.matchScore) },
                  ]}
                >
                  {applicant.matchScore}%
                </Text>
              </View>
            )}
          </View>
          <Text variant="bodySmall" style={styles.role}>
            {applicant.role}
          </Text>
          <Text variant="bodySmall" style={styles.timestamp}>
            Applied {getTimeAgo(applicant.appliedAt)}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.background,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  matchBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  matchScore: {
    fontSize: 12,
    fontWeight: '700',
  },
  role: {
    color: colors.textSecondary,
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: 11,
  },
});
