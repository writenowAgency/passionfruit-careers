import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { MatchScoreBadge } from '../common/MatchScoreBadge';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import type { Job } from '../../types';
import { Image } from 'expo-image';

interface Props {
  job: Job;
  onApply: () => void;
  onSave: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const JobCard: React.FC<Props> = ({ job, onApply, onSave }) => {
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(shadows.md.shadowOpacity);

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    shadowOpacity.value = withTiming(shadows.sm.shadowOpacity);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    shadowOpacity.value = withTiming(shadows.md.shadowOpacity);
  };

  const renderRightActions = () => (
    <View style={[styles.swipeAction, styles.swipeActionApply]}>
      <Ionicons name="paper-plane" size={24} color={colors.text} />
      <Text style={styles.swipeActionText}>Apply</Text>
    </View>
  );

  const renderLeftActions = () => (
    <View style={[styles.swipeAction, styles.swipeActionSave]}>
      <Ionicons name="bookmark" size={24} color={colors.text} />
      <Text style={styles.swipeActionText}>Save</Text>
    </View>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      onSwipeableRightOpen={onApply}
      onSwipeableLeftOpen={onSave}
      friction={2}
      overshootRight={false}
      overshootLeft={false}
    >
      <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
        <Card style={styles.card} accessibilityRole="summary">
          <Card.Content style={styles.cardContent}>
            {/* Header with Logo and Match Score */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={{ uri: job.companyLogo }}
                  style={styles.logo}
                  cachePolicy="memory-disk"
                  contentFit="cover"
                />
              </View>
              <View style={styles.headerInfo}>
                <Text variant="titleLarge" style={styles.jobTitle} numberOfLines={2}>
                  {job.title}
                </Text>
                <Text variant="bodyMedium" style={styles.companyName}>
                  {job.company}
                </Text>
              </View>
              <View style={styles.matchBadgeContainer}>
                <MatchScoreBadge score={job.matchScore} size="small" />
              </View>
            </View>

            {/* Location & Job Type Chips */}
            <View style={styles.chipsContainer}>
              <Chip
                icon={() => <Ionicons name="location" size={14} color={colors.text} />}
                style={styles.chip}
                textStyle={styles.chipText}
                compact
              >
                {job.location}
              </Chip>
              <Chip
                icon={() => <Ionicons name="briefcase" size={14} color={colors.text} />}
                style={styles.chip}
                textStyle={styles.chipText}
                compact
              >
                {job.type}
              </Chip>
              <Chip
                icon={() => <Ionicons name="cash" size={14} color={colors.text} />}
                style={[styles.chip, styles.salaryChip]}
                textStyle={styles.salaryChipText}
                compact
              >
                {job.salary}
              </Chip>
            </View>

            {/* Description */}
            <Text variant="bodyMedium" style={styles.description} numberOfLines={3}>
              {job.description}
            </Text>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {job.tags.slice(0, 3).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {job.tags.length > 3 && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>+{job.tags.length - 3}</Text>
                </View>
              )}
            </View>

            {/* Footer with Date and Apply Button */}
            <View style={styles.footer}>
              <View style={styles.dateContainer}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text variant="bodySmall" style={styles.dateText}>
                  {job.postedDate}
                </Text>
              </View>
              <AnimatedPressable
                onPress={onApply}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                accessibilityRole="button"
                accessibilityLabel="Quick Apply"
              >
                <LinearGradient
                  colors={colors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.applyButton}
                >
                  <Text style={styles.applyButtonText}>Quick Apply</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.text} />
                </LinearGradient>
              </AnimatedPressable>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  cardContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    ...shadows.sm,
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  headerInfo: {
    flex: 1,
  },
  jobTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  companyName: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  matchBadgeContainer: {
    marginTop: -spacing.xs,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    height: 32,
  },
  chipText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  salaryChip: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  salaryChipText: {
    color: colors.text,
    fontWeight: '600',
  },
  description: {
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  tagText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    color: colors.textSecondary,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.pill,
    gap: spacing.sm,
    ...shadows.sm,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
  },
  swipeActionApply: {
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  swipeActionSave: {
    backgroundColor: colors.primaryLight,
    marginRight: spacing.sm,
  },
  swipeActionText: {
    marginTop: spacing.xs,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
});
