import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '@/theme';

export interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
}

export const FunnelChart: React.FC<FunnelChartProps> = ({ stages }) => {
  const maxValue = stages.length > 0 ? stages[0].value : 1;

  const calculatePercentage = (value: number) => {
    return Math.round((value / maxValue) * 100);
  };

  const calculateDropoff = (currentValue: number, previousValue: number) => {
    if (previousValue === 0) return 0;
    return Math.round(((previousValue - currentValue) / previousValue) * 100);
  };

  return (
    <View style={styles.container}>
      {stages.map((stage, index) => {
        const widthPercentage = calculatePercentage(stage.value);
        const dropoff = index > 0 ? calculateDropoff(stage.value, stages[index - 1].value) : 0;

        return (
          <View key={stage.label} style={styles.stageContainer}>
            <View style={styles.barContainer}>
              <LinearGradient
                colors={[stage.color, `${stage.color}CC`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.bar, { width: `${widthPercentage}%` }]}
              >
                <View style={styles.barContent}>
                  <Text variant="labelLarge" style={styles.barLabel}>
                    {stage.label}
                  </Text>
                  <Text variant="titleMedium" style={styles.barValue}>
                    {stage.value.toLocaleString()}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            <View style={styles.statsRow}>
              <Text variant="bodySmall" style={styles.percentage}>
                {widthPercentage}% of total
              </Text>
              {index > 0 && (
                <Text variant="bodySmall" style={styles.dropoff}>
                  -{dropoff}% from previous
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  stageContainer: {
    gap: spacing.xs,
  },
  barContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  bar: {
    minHeight: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    minWidth: 120,
  },
  barContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  barLabel: {
    color: colors.background,
    fontWeight: '700',
  },
  barValue: {
    color: colors.background,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  percentage: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dropoff: {
    color: colors.error,
    fontWeight: '600',
  },
});
