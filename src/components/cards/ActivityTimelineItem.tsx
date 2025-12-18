import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/theme';

export interface Activity {
  id: number;
  type: 'application' | 'job_posted' | 'review' | 'interview';
  title: string;
  description?: string;
  timestamp: string;
}

interface ActivityTimelineItemProps {
  activity: Activity;
  isLast?: boolean;
}

export const ActivityTimelineItem: React.FC<ActivityTimelineItemProps> = ({
  activity,
  isLast = false,
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'application':
        return 'person-add';
      case 'job_posted':
        return 'briefcase';
      case 'review':
        return 'checkmark-circle';
      case 'interview':
        return 'calendar';
      default:
        return 'ellipse';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'application':
        return colors.info;
      case 'job_posted':
        return colors.primary;
      case 'review':
        return colors.success;
      case 'interview':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const activityColor = getActivityColor(activity.type);

  return (
    <View style={styles.container}>
      <View style={styles.timeline}>
        <View style={[styles.dot, { backgroundColor: activityColor }]}>
          <Ionicons name={getActivityIcon(activity.type)} size={12} color={colors.background} />
        </View>
        {!isLast && <View style={styles.line} />}
      </View>

      <View style={styles.content}>
        <Text variant="titleSmall" style={styles.title}>
          {activity.title}
        </Text>
        {activity.description && (
          <Text variant="bodySmall" style={styles.description}>
            {activity.description}
          </Text>
        )}
        <Text variant="bodySmall" style={styles.timestamp}>
          {getTimeAgo(activity.timestamp)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeline: {
    alignItems: 'center',
    width: 24,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border,
    marginTop: spacing.xs,
    minHeight: 40,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: 11,
  },
});
