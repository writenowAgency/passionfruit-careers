import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { employerApi, Activity } from '@/services/employerApi';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { ActivityTimelineItem } from '@/components/cards/ActivityTimelineItem';
import { FadeIn } from '@/components/animations/FadeIn';

const RecentActivity: React.FC = () => {
  const token = useAppSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchActivities();
  }, [token]);

  const fetchActivities = async () => {
    if (!token) return;

    try {
      setLoading(true);
      // Fetch more activities for the full page (50 instead of 5)
      const data = await employerApi.getRecentActivity(token, 50);
      setActivities(data.activities);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading activities...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <FadeIn delay={0}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="pulse" size={32} color={colors.primary} />
          </View>
          <Text variant="headlineMedium" style={styles.title}>
            Recent Activity
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Real-time feed of your recruitment activities
          </Text>
        </View>
      </FadeIn>

      <FadeIn delay={100}>
        <Card style={styles.card}>
          <Card.Content>
            {activities.length > 0 ? (
              <View style={styles.timelineContainer}>
                {activities.map((activity, index) => (
                  <ActivityTimelineItem
                    key={activity.id}
                    activity={activity}
                    isLast={index === activities.length - 1}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={64} color={colors.textTertiary} />
                <Text variant="titleLarge" style={styles.emptyStateTitle}>
                  No Activity Yet
                </Text>
                <Text variant="bodyMedium" style={styles.emptyStateText}>
                  Your recent recruitment activities will appear here
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </FadeIn>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.pill,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  timelineContainer: {
    gap: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateTitle: {
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default RecentActivity;
