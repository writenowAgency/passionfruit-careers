import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, DimensionValue } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { Job } from '@/services/employerApi';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useResponsive } from '@/hooks/useResponsive';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';

interface EmployerJobCardProps {
  job: Job;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewApplicants?: () => void;
}

export const EmployerJobCard: React.FC<EmployerJobCardProps> = ({
  job,
  onPress,
  onEdit,
  onDelete,
  onViewApplicants,
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const responsive = useResponsiveStyles();
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

  const formatSalaryValue = (value: string) => {
    const num = parseInt(value);
    if (num >= 1000000) {
      const millions = num / 1000000;
      return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    } else {
      const thousands = num / 1000;
      return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(0)}k`;
    }
  };

  const formatSalary = (min: string | null, max: string | null, currency: string | null) => {
    if (!min && !max) return 'Salary not specified';
    const symbol = (currency || 'ZAR') === 'ZAR' ? 'R' : currency;
    if (min && max) return `${symbol}${formatSalaryValue(min)} - ${symbol}${formatSalaryValue(max)}`;
    if (min) return `From ${symbol}${formatSalaryValue(min)}`;
    if (max) return `Up to ${symbol}${formatSalaryValue(max)}`;
    return '';
  };

  const getStatusColor = () => {
    switch (job.status) {
      case 'published':
        return colors.success;
      case 'draft':
        return colors.textSecondary;
      case 'closed':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusBgColor = () => {
    switch (job.status) {
      case 'published':
        return `${colors.success}15`;
      case 'draft':
        return `${colors.textSecondary}15`;
      case 'closed':
        return `${colors.error}15`;
      default:
        return `${colors.textSecondary}15`;
    }
  };

  // Dynamic styles based on device type
  const getDetailItemStyle = (): ViewStyle => {
    if (isMobile) return { minWidth: '100%' as DimensionValue };
    if (isTablet) return { minWidth: '48%' as DimensionValue };
    return { minWidth: '30%' as DimensionValue };
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.container}
      >
        {/* Top accent bar */}
        <LinearGradient
          colors={
            job.status === 'published'
              ? [colors.primary, colors.secondary]
              : [colors.textSecondary, colors.textTertiary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.accentBar}
        />

        <View style={[styles.content, { padding: responsive.padding(spacing.lg) }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text variant="titleLarge" style={styles.title}>
                {job.title}
              </Text>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: getStatusBgColor() }]}
                textStyle={[styles.chipText, { color: getStatusColor() }]}
              >
                {job.status}
              </Chip>
            </View>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            {job.location && (
              <View style={[styles.detailItem, getDetailItemStyle()]}>
                <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}15` }]}>
                  <Ionicons name="location" size={16} color={colors.primary} />
                </View>
                <Text variant="bodyMedium" style={styles.detailText}>
                  {job.location}
                </Text>
              </View>
            )}

            {job.job_type && (
              <View style={[styles.detailItem, getDetailItemStyle()]}>
                <View style={[styles.iconBadge, { backgroundColor: `${colors.secondary}15` }]}>
                  <Ionicons name="time" size={16} color={colors.secondary} />
                </View>
                <Text variant="bodyMedium" style={styles.detailText}>
                  {job.job_type}
                </Text>
              </View>
            )}

            <View style={[styles.detailItem, getDetailItemStyle()]}>
              <View style={[styles.iconBadge, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="cash" size={16} color={colors.success} />
              </View>
              <Text variant="bodyMedium" style={styles.detailText}>
                {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
              </Text>
            </View>

            {job.experience_level && (
              <View style={[styles.detailItem, getDetailItemStyle()]}>
                <View style={[styles.iconBadge, { backgroundColor: `${colors.info}15` }]}>
                  <Ionicons name="school" size={16} color={colors.info} />
                </View>
                <Text variant="bodyMedium" style={styles.detailText}>
                  {job.experience_level} level
                </Text>
              </View>
            )}
          </View>

          {/* Stats Row */}
          <View style={[styles.statsContainer, { gap: responsive.spacing(spacing.sm) }]}>
            <View style={styles.statCard}>
              <Ionicons name="eye" size={20} color={colors.primary} />
              <View>
                <Text variant="titleMedium" style={styles.statValue}>
                  {job.views_count || 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Views
                </Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="people" size={20} color={colors.secondary} />
              <View>
                <Text variant="titleMedium" style={styles.statValue}>
                  {job.applications_count || 0}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Applications
                </Text>
              </View>
            </View>

            {job.applications_count > 0 && (
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <View>
                  <Text variant="titleMedium" style={styles.statValue}>
                    {Math.round(((job.applications_count || 0) / Math.max(job.views_count || 1, 1)) * 100)}%
                  </Text>
                  <Text variant="bodySmall" style={styles.statLabel}>
                    Conv. Rate
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {onViewApplicants && job.applications_count > 0 && (
              <Pressable
                style={[styles.actionButton, styles.primaryAction]}
                onPress={(e) => {
                  e.stopPropagation();
                  onViewApplicants();
                }}
              >
                <Ionicons name="people" size={18} color={colors.background} />
                <Text style={styles.primaryActionText}>View Applicants</Text>
              </Pressable>
            )}

            {onEdit && (
              <Pressable
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Ionicons name="pencil" size={18} color={colors.primary} />
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
            )}

            {onDelete && (
              <Pressable
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Ionicons name="trash" size={18} color={colors.error} />
                <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  accentBar: {
    height: 4,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
  },
  statValue: {
    color: colors.text,
    fontWeight: '700',
    lineHeight: 20,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  primaryAction: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  primaryActionText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
});
