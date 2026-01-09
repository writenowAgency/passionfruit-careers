import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { Skeleton } from '@/components/common/Skeleton';
import { spacing, borderRadius, colors } from '@/theme';

export const JobCardSkeleton = () => {
  return (
    <Surface style={styles.card} elevation={1}>
      {/* Header */}
      <View style={styles.header}>
        <Skeleton width={56} height={56} borderRadius={borderRadius.md} />
        <View style={styles.headerContent}>
          <Skeleton width="60%" height={20} style={{ marginBottom: spacing.xs }} />
          <Skeleton width="40%" height={16} />
        </View>
        <Skeleton width={24} height={24} borderRadius={borderRadius.pill} />
      </View>

      {/* Chips */}
      <View style={styles.chips}>
        <Skeleton width={80} height={32} borderRadius={borderRadius.pill} />
        <Skeleton width={80} height={32} borderRadius={borderRadius.pill} />
        <Skeleton width={100} height={32} borderRadius={borderRadius.pill} />
      </View>

      {/* Description */}
      <View style={styles.description}>
        <Skeleton width="100%" height={16} style={{ marginBottom: spacing.xs }} />
        <Skeleton width="90%" height={16} style={{ marginBottom: spacing.xs }} />
        <Skeleton width="60%" height={16} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Skeleton width={60} height={16} />
        <Skeleton width={100} height={36} borderRadius={borderRadius.pill} />
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
