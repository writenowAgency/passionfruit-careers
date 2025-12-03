import React from 'react';
import { SafeAreaView, View, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { JobCard } from '@/components/cards/JobCard';
import DailyMatchesWidget from '@/screens/jobSeeker/dashboard/DailyMatchesWidget';
import { mockJobs } from '@/data/mockJobs';
import { CacheService } from '@/services/cache';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setJobs, setStatus, toggleSavedJob } from '@/store/slices/jobsSlice';
import { useGetJobsQuery } from '@/store/api/apiSlice';
import type { Job } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { useAnalytics } from '@/hooks/useAnalytics';
import { SlideIn } from '@/components/animations/SlideIn';
import { FadeIn } from '@/components/animations/FadeIn';

const CACHE_KEY = 'jobs_cache';

const HomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const { track } = useAnalytics();
  const jobs = useAppSelector((state) => state.jobs.list);
  const status = useAppSelector((state) => state.jobs.status);
  const profile = useAppSelector((state) => state.profile);
  const { data, isFetching, refetch } = useGetJobsQuery();

  // Get current hour for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  React.useEffect(() => {
    (async () => {
      const cached = await CacheService.get<Job[]>(CACHE_KEY);
      if (cached?.length) {
        dispatch(setJobs(cached));
      } else {
        dispatch(setJobs(mockJobs));
      }
    })();
  }, [dispatch]);

  React.useEffect(() => {
    if (data?.length) {
      dispatch(setJobs(data));
      CacheService.set(CACHE_KEY, data);
    }
  }, [data, dispatch]);

  const onRefresh = async () => {
    dispatch(setStatus('loading'));
    await refetch();
  };

  const renderItem = ({ item }: { item: Job }) => (
    <JobCard
      job={item}
      onApply={() => {
        track('job_quick_apply', { jobId: item.id });
        navigation.navigate('Jobs' as never, {
          screen: 'JobDetails',
          params: { jobId: item.id },
        } as never);
      }}
      onSave={() => dispatch(toggleSavedJob(item.id))}
    />
  );

  const WelcomeHeader = () => (
    <View style={styles.welcomeContainer}>
      <FadeIn delay={0}>
        <View style={styles.greetingSection}>
          <View style={styles.greetingTextContainer}>
            <Text variant="headlineMedium" style={styles.greeting}>
              {getGreeting()}
            </Text>
            <Text variant="displaySmall" style={styles.userName}>
              {profile.personalInfo?.name || 'Job Seeker'}
            </Text>
          </View>
          <Pressable
            style={styles.notificationButton}
            onPress={() => {
              // Navigate to notifications
              track('notification_button_pressed');
            }}
          >
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
            <Ionicons name="notifications" size={28} color={colors.text} />
          </Pressable>
        </View>
      </FadeIn>

      {/* Stats Cards */}
      <FadeIn delay={100}>
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <Ionicons name="briefcase" size={24} color={colors.text} />
            <Text variant="headlineSmall" style={styles.statValue}>
              {jobs.length}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              New Matches
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={colors.gradientSecondary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <Ionicons name="send" size={24} color={colors.background} />
            <Text variant="headlineSmall" style={[styles.statValue, { color: colors.background }]}>
              12
            </Text>
            <Text variant="bodySmall" style={[styles.statLabel, { color: colors.background }]}>
              Applications
            </Text>
          </LinearGradient>

          <LinearGradient
            colors={colors.gradientAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <Ionicons name="chatbubbles" size={24} color={colors.background} />
            <Text variant="headlineSmall" style={[styles.statValue, { color: colors.background }]}>
              4
            </Text>
            <Text variant="bodySmall" style={[styles.statLabel, { color: colors.background }]}>
              Interviews
            </Text>
          </LinearGradient>
        </View>
      </FadeIn>

      {/* Section Title */}
      <FadeIn delay={200}>
        <View style={styles.sectionHeader}>
          <View>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Today's Matches
            </Text>
            <Text variant="bodyMedium" style={styles.sectionSubtitle}>
              Swipe right to apply, left to save
            </Text>
          </View>
          <Ionicons name="sparkles" size={24} color={colors.secondary} />
        </View>
      </FadeIn>
    </View>
  );

  const ListHeader = () => (
    <>
      <SlideIn delay={300}>
        <DailyMatchesWidget matches={jobs} />
      </SlideIn>
      <View style={styles.divider} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      {status === 'loading' && !jobs.length ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      ) : jobs.length ? (
        <FlashList
          data={jobs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={340}
          refreshing={isFetching}
          onRefresh={onRefresh}
          ListHeaderComponent={
            <>
              <WelcomeHeader />
              <ListHeader />
            </>
          }
          ListFooterComponent={<View style={styles.listFooter} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <>
          <WelcomeHeader />
          <View style={styles.emptyContainer}>
            <EmptyState
              title="No matches yet"
              subtitle="Complete your profile to start receiving personalized job matches"
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greeting: {
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  userName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 32,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.accent,
    borderRadius: borderRadius.pill,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  notificationBadgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  statValue: {
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    color: colors.text,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
    marginHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  listFooter: {
    height: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
});

export default HomeScreen;
