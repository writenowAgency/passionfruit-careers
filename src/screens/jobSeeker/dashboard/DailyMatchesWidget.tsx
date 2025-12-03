import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { MatchScoreBadge } from '@/components/common/MatchScoreBadge';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import type { Job } from '@/types';

interface Props {
  matches: Job[];
}

const DailyMatchesWidget: React.FC<Props> = ({ matches }) => {
  const topMatches = matches.slice(0, 3);

  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={['#FFFAEB', '#FFF9E6']}
        style={styles.gradient}
      >
        <Card.Content style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="sparkles" size={24} color={colors.secondary} />
              </View>
              <View>
                <Text variant="titleLarge" style={styles.title}>
                  AI Daily Matches
                </Text>
                <Text variant="bodySmall" style={styles.subtitle}>
                  Powered by your profile
                </Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          </View>

          {/* Match Count Summary */}
          <View style={styles.summaryContainer}>
            <Text variant="bodyMedium" style={styles.summaryText}>
              <Text style={styles.summaryHighlight}>{matches.length} perfect matches</Text> found for you today
            </Text>
          </View>

          {/* Top Matches List */}
          <View style={styles.matchesList}>
            {topMatches.map((match, index) => (
              <Pressable key={match.id} style={styles.matchItem}>
                <View style={styles.matchRank}>
                  <Text style={styles.matchRankText}>#{index + 1}</Text>
                </View>

                <View style={styles.matchLogoContainer}>
                  <Image
                    source={{ uri: match.companyLogo }}
                    style={styles.matchLogo}
                    cachePolicy="memory-disk"
                    contentFit="cover"
                  />
                </View>

                <View style={styles.matchInfo}>
                  <Text variant="titleSmall" style={styles.matchTitle} numberOfLines={1}>
                    {match.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.matchCompany} numberOfLines={1}>
                    {match.company}
                  </Text>
                  <View style={styles.matchTags}>
                    {match.tags.slice(0, 2).map((tag) => (
                      <Chip
                        key={tag}
                        style={styles.tag}
                        textStyle={styles.tagText}
                        compact
                      >
                        {tag}
                      </Chip>
                    ))}
                    {match.tags.length > 2 && (
                      <Text style={styles.moreTags}>+{match.tags.length - 2}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.matchScoreContainer}>
                  <MatchScoreBadge score={match.matchScore} size="small" />
                </View>
              </Pressable>
            ))}
          </View>

          {/* View All Button */}
          {matches.length > 3 && (
            <Pressable style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>
                View all {matches.length} matches
              </Text>
              <Ionicons name="arrow-forward" size={16} color={colors.text} />
            </Pressable>
          )}
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xxl,
    ...shadows.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: borderRadius.xxl,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  title: {
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
  },
  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  summaryContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  summaryText: {
    color: colors.text,
    textAlign: 'center',
  },
  summaryHighlight: {
    fontWeight: '700',
    color: colors.secondary,
  },
  matchesList: {
    gap: spacing.sm,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  matchRank: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  matchLogoContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  matchLogo: {
    width: '100%',
    height: '100%',
  },
  matchInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  matchTitle: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  matchCompany: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  matchTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  tag: {
    height: 24,
    backgroundColor: colors.surfaceVariant,
  },
  tagText: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  moreTags: {
    fontSize: 10,
    color: colors.textTertiary,
    fontWeight: '600',
  },
  matchScoreContainer: {
    marginLeft: spacing.xs,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});

export default DailyMatchesWidget;
