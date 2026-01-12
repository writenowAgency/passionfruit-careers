import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useResponsive } from '@/hooks/useResponsive';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  popular?: boolean;
  savings?: string;
  features: string[];
}

interface CreditPackageCardProps {
  package: CreditPackage;
  onPress: () => void;
}

export const CreditPackageCard: React.FC<CreditPackageCardProps> = ({
  package: pkg,
  onPress,
}) => {
  const { isMobile } = useResponsive();
  const responsive = useResponsiveStyles();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pricePerCredit = (pkg.price / pkg.credits).toFixed(2);

  return (
    <Animated.View style={[
      styles.container,
      animatedStyle,
      !isMobile && { flex: 1, minWidth: 300 } // Allow grid layout on tablet/desktop
    ]}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <LinearGradient
          colors={
            pkg.popular
              ? [colors.primary, colors.secondary]
              : [colors.surface, colors.surface]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {pkg.popular && (
            <View style={styles.popularBadge}>
              <Ionicons name="star" size={14} color={colors.background} />
              <Text style={styles.popularText}>Most Popular</Text>
            </View>
          )}

          <View style={[
            styles.content,
            pkg.popular && styles.contentPopular,
            { padding: responsive.padding(spacing.xl) }
          ]}>
            {/* Header */}
            <View style={styles.header}>
              <Text
                variant="headlineMedium"
                style={[styles.packageName, pkg.popular && styles.textWhite]}
              >
                {pkg.name}
              </Text>
              {pkg.savings && (
                <Chip
                  mode="flat"
                  style={styles.savingsChip}
                  textStyle={styles.savingsText}
                >
                  Save {pkg.savings}
                </Chip>
              )}
            </View>

            {/* Credits */}
            <View style={styles.creditsSection}>
              <View style={styles.creditsRow}>
                <Ionicons
                  name="diamond"
                  size={32}
                  color={pkg.popular ? colors.background : colors.primary}
                />
                <Text
                  variant="displayMedium"
                  style={[styles.creditsValue, pkg.popular && styles.textWhite]}
                >
                  {pkg.credits.toLocaleString()}
                </Text>
              </View>
              <Text
                variant="bodyMedium"
                style={[styles.creditsLabel, pkg.popular && styles.textWhite]}
              >
                Credits
              </Text>
            </View>

            {/* Price */}
            <View style={styles.priceSection}>
              <View style={styles.priceRow}>
                <Text
                  variant="displaySmall"
                  style={[styles.price, pkg.popular && styles.textWhite]}
                >
                  {pkg.currency === 'ZAR' ? 'R' : pkg.currency}
                  {pkg.price.toLocaleString()}
                </Text>
              </View>
              <Text
                variant="bodySmall"
                style={[styles.pricePerCredit, pkg.popular && styles.textWhite]}
              >
                {pkg.currency === 'ZAR' ? 'R' : pkg.currency}
                {pricePerCredit} per credit
              </Text>
            </View>

            {/* Features */}
            <View style={styles.features}>
              {pkg.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={pkg.popular ? colors.background : colors.success}
                  />
                  <Text
                    variant="bodyMedium"
                    style={[styles.featureText, pkg.popular && styles.textWhite]}
                  >
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            {/* Button */}
            <View
              style={[
                styles.button,
                pkg.popular ? styles.buttonPopular : styles.buttonDefault,
              ]}
            >
              <Text style={pkg.popular ? styles.buttonTextPopular : styles.buttonTextDefault}>
                Purchase Package
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={pkg.popular ? colors.primary : colors.background}
              />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  gradient: {
    flex: 1,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    justifyContent: 'center',
  },
  popularText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 13,
  },
  content: {
    gap: spacing.lg,
  },
  contentPopular: {
    paddingTop: spacing.lg,
  },
  header: {
    gap: spacing.sm,
  },
  packageName: {
    color: colors.text,
    fontWeight: '800',
  },
  savingsChip: {
    backgroundColor: colors.success,
    alignSelf: 'flex-start',
  },
  savingsText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 12,
  },
  creditsSection: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  creditsValue: {
    color: colors.text,
    fontWeight: '800',
  },
  creditsLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  priceSection: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    color: colors.text,
    fontWeight: '800',
  },
  pricePerCredit: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  features: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  buttonDefault: {
    backgroundColor: colors.primary,
  },
  buttonPopular: {
    backgroundColor: colors.background,
  },
  buttonTextDefault: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  buttonTextPopular: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  textWhite: {
    color: colors.background,
  },
});
