import { View, StyleSheet, Pressable, ColorValue } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface MetricCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  trend?: number;
  trendLabel?: string;
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  value,
  label,
  trend,
  trendLabel,
  gradientColors = [colors.surface, colors.surface] as readonly [ColorValue, ColorValue],
  onPress,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withTiming(0.97, { duration: 100 });
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withTiming(1, { duration: 100 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getTrendColor = () => {
    if (trend === undefined) return colors.textSecondary;
    return trend >= 0 ? colors.success : colors.error;
  };

  const getTrendIcon = () => {
    if (trend === undefined) return null;
    return trend >= 0 ? 'trending-up' : 'trending-down';
  };

  const content = (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name={icon} size={24} color={colors.primary} />
          </View>
          {trend !== undefined && getTrendIcon() && (
            <View style={styles.trendBadge}>
              <Ionicons name={getTrendIcon()!} size={14} color={getTrendColor()} />
              <Text variant="labelSmall" style={[styles.trendText, { color: getTrendColor() }]}>
                {trend >= 0 ? '+' : ''}
                {trend}%
              </Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text variant="displaySmall" style={styles.value}>
            {value}
          </Text>
          <Text variant="bodyMedium" style={styles.label}>
            {label}
          </Text>
          {trendLabel && (
            <Text variant="bodySmall" style={styles.trendLabel}>
              {trendLabel}
            </Text>
          )}
        </View>
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: '47%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  gradient: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  trendText: {
    fontWeight: '700',
    fontSize: 12,
  },
  body: {
    gap: spacing.xs,
  },
  value: {
    color: colors.text,
    fontWeight: '800',
    lineHeight: 40,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
  trendLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
