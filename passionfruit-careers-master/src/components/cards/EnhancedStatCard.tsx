import { View, StyleSheet, Pressable, ColorValue } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CircularProgress } from '@/components/common/CircularProgress';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface EnhancedStatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  trend?: number;
  progress?: number;
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  onPress?: () => void;
}

export const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  icon,
  value,
  label,
  trend,
  progress = 0,
  gradientColors = [colors.surface, colors.surface] as readonly [ColorValue, ColorValue],
  onPress,
}) => {
  const responsive = useResponsiveStyles();
  const scale = useSharedValue(1);
  const elevation = useSharedValue(4);

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
    elevation.value = withTiming(8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
    elevation.value = withTiming(4, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getTrendColor = () => {
    if (!trend) return colors.textSecondary;
    return trend >= 0 ? colors.success : colors.error;
  };

  const getTrendIcon = () => {
    if (!trend) return 'remove';
    return trend >= 0 ? 'trending-up' : 'trending-down';
  };

  const content = (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        {
          padding: responsive.spacing(spacing.md),
          minHeight: 160,
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>

      <View style={styles.progressContainer}>
        <CircularProgress
          percentage={progress}
          size={70}
          strokeWidth={6}
          color={colors.primary}
          backgroundColor="rgba(0,0,0,0.05)"
        />
        <View style={styles.valueContainer}>
          <Text variant="headlineMedium" style={styles.value}>
            {value}
          </Text>
        </View>
      </View>

      <Text variant="bodyMedium" style={styles.label}>
        {label}
      </Text>

      {trend !== undefined && (
        <View style={[styles.trendBadge, { backgroundColor: `${getTrendColor()}15` }]}>
          <Ionicons name={getTrendIcon()} size={12} color={getTrendColor()} />
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {trend >= 0 ? '+' : ''}
            {trend}%
          </Text>
        </View>
      )}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return <Animated.View style={animatedStyle}>{content}</Animated.View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  iconContainer: {
    marginBottom: spacing.xs,
  },
  progressContainer: {
    position: 'relative',
    marginBottom: spacing.xs,
  },
  valueContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
    lineHeight: 18,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
