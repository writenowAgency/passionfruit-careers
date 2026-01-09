import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import { Skeleton } from '@/components/common/Skeleton';
import { spacing, borderRadius, colors } from '@/theme';

export const ApplicationCardSkeleton = () => {
  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Skeleton width="70%" height={24} style={{ marginBottom: spacing.xs }} />
          <Skeleton width="50%" height={16} />
        </View>
        <Skeleton width={80} height={32} borderRadius={borderRadius.pill} />
      </View>
      
      <View style={styles.details}>
        <Skeleton width="40%" height={16} />
        <Skeleton width="30%" height={16} />
        <Skeleton width="35%" height={16} />
      </View>

      <View style={styles.progress}>
        <View style={styles.progressHeader}>
          <Skeleton width={120} height={14} />
          <Skeleton width={60} height={20} borderRadius={borderRadius.sm} />
        </View>
        <Skeleton width="100%" height={6} borderRadius={borderRadius.sm} />
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  details: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  progress: {
    marginTop: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
});
