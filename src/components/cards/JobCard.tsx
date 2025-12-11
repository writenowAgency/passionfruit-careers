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
  onView?: () => void;
  isApplying?: boolean;
  hasApplied?: boolean;
  isSaved?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const JobCard: React.FC<Props> = ({ job, onApply, onSave, onView, isApplying = false, hasApplied = false, isSaved = false }) => {
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

  // Format salary with smart k/M notation
  const formatSalaryValue = (value: string) => {
    const num = parseInt(value);
    if (num >= 1000000) {
      // Use millions for values >= 1M
      const millions = num / 1000000;
      return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    } else {
      // Use thousands for values < 1M
      const thousands = num / 1000;
      return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(0)}k`;
    }
  };

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return 'Competitive';
    const symbol = (job.salaryCurrency || 'ZAR') === 'ZAR' ? 'R' : job.salaryCurrency;

    if (job.salaryMin && job.salaryMax) {
      return `${symbol}${formatSalaryValue(job.salaryMin)} - ${symbol}${formatSalaryValue(job.salaryMax)}`;
    }
    if (job.salaryMin) return `From ${symbol}${formatSalaryValue(job.salaryMin)}`;
    if (job.salaryMax) return `Up to ${symbol}${formatSalaryValue(job.salaryMax)}`;
    return 'Competitive';
  };

  // Format date
  const formatDate = () => {
    const date = new Date(job.createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    return `${Math.floor(diffInDays / 30)}mo ago`;
  };

  // Extract requirements as tags
  const getTags = () => {
    if (!job.requirements) return [];
    return job.requirements.split(',').map(r => r.trim()).slice(0, 4);
  };

  const matchScore = job.matchScore || Math.floor(Math.random() * 20) + 75;

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
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            {/* Header with Logo and Match Score */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                {job.companyLogo ? (
                  <Image
                    source={{ uri: job.companyLogo }}
                    style={styles.logo}
                    cachePolicy="memory-disk"
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.logo, { backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
                      {job.company.charAt(0)}
                    </Text>
                  </View>
                )}
                {hasApplied && (
                  <View style={styles.appliedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  </View>
                )}
              </View>
              <Pressable onPress={onView} style={styles.headerInfo}>
                <View style={styles.titleRow}>
                  <Text variant="titleLarge" style={styles.jobTitle} numberOfLines={2}>
                    {job.title}
                  </Text>
                  {hasApplied && (
                    <View style={styles.appliedTag}>
                      <Text style={styles.appliedTagText}>Applied!</Text>
                    </View>
                  )}
                </View>
                <Text variant="bodyMedium" style={styles.companyName}>
                  {job.company}
                </Text>
              </Pressable>
              <Pressable onPress={onSave} style={styles.saveButton}>
                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={24} color={isSaved ? colors.primary : colors.textSecondary} />
              </Pressable>
            </View>

            {/* Location & Job Type Chips */}
            <View style={styles.chipsContainer}>
              {job.location && (
                <Chip
                  icon={() => <Ionicons name="location" size={14} color={colors.text} />}
                  style={styles.chip}
                  textStyle={styles.chipText}
                  compact
                >
                  {job.location}
                </Chip>
              )}
              {job.jobType && (
                <Chip
                  icon={() => <Ionicons name="briefcase" size={14} color={colors.text} />}
                  style={styles.chip}
                  textStyle={styles.chipText}
                  compact
                >
                  {job.jobType}
                </Chip>
              )}
              <Chip
                icon={() => <Ionicons name="cash" size={14} color={colors.text} />}
                style={[styles.chip, styles.salaryChip]}
                textStyle={styles.salaryChipText}
                compact
              >
                {formatSalary()}
              </Chip>
            </View>

            {/* Description */}
            <Pressable onPress={onView}>
              <Text variant="bodyMedium" style={styles.description} numberOfLines={3}>
                {job.description}
              </Text>
            </Pressable>

            {/* Tags */}
            {getTags().length > 0 && (
              <View style={styles.tagsContainer}>
                {getTags().map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Footer with Date and Buttons */}
            <View style={styles.footer}>
              <View style={styles.dateContainer}>
                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                <Text variant="bodySmall" style={styles.dateText}>
                  {formatDate()}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <MatchScoreBadge score={matchScore} size="small" />
                {onView && (
                  <Pressable onPress={onView} style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View</Text>
                  </Pressable>
                )}
                {hasApplied ? (
                  <View style={styles.appliedButton}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text style={styles.appliedButtonText}>Applied</Text>
                  </View>
                ) : (
                  <AnimatedPressable
                    onPress={onApply}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    accessibilityRole="button"
                    accessibilityLabel="Quick Apply"
                    disabled={isApplying}
                  >
                    <LinearGradient
                      colors={(isApplying ? [colors.surfaceVariant, colors.surfaceVariant] : colors.gradientPrimary) as [string, string, ...string[]]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.applyButton, isApplying && { opacity: 0.7 }]}
                    >
                      <Text style={styles.applyButtonText}>
                        {isApplying ? 'Applying...' : 'Quick Apply'}
                      </Text>
                      {isApplying ? (
                        <View style={{ width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontSize: 18 }}>⏳</Text>
                        </View>
                      ) : (
                        <Ionicons name="arrow-forward" size={18} color={colors.text} />
                      )}
                    </LinearGradient>
                  </AnimatedPressable>
                )}
              </View>
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
        position: 'absolute',
        top: -20,
        right: -20,
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
        backgroundColor: '#ffc107',
        marginRight: spacing.sm,
    },
    swipeActionText: {
        marginTop: spacing.xs,
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
    },
    appliedBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: colors.background,
        borderRadius: borderRadius.pill,
        padding: 2,
        ...shadows.sm,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
    },
    appliedTag: {
        backgroundColor: colors.successLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.xs,
        borderWidth: 1,
        borderColor: colors.success,
    },
    appliedTagText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.success,
    },
    appliedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.successLight,
        borderRadius: borderRadius.pill,
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.success,
    },
    appliedButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.success,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.background,
        borderRadius: borderRadius.pill,
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    viewButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
    },
    saveButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 8,
        borderRadius: 100,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
});
