import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView, View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text, Avatar, Chip, Searchbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { JobCard } from '@/components/cards/JobCard';
import { JobDetailsModal } from '@/components/modals/JobDetailsModal';
import { CacheService } from '@/services/cache';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setJobs, setStatus, toggleSavedJob, fetchSavedJobs } from '@/store/slices/jobsSlice';
import { fetchProfile } from '@/store/slices/profileSlice';
import { useGetJobsQuery } from '@/store/api/apiSlice';
import type { Job } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { useAnalytics } from '@/hooks/useAnalytics';
import { FadeIn } from '@/components/animations/FadeIn';
import { jobSeekerApi, DashboardStats } from '@/services/jobSeekerApi';

const CACHE_KEY = 'jobs_cache';

type FilterType = 'all' | 'recent' | 'applied' | 'saved' | 'recommended';

const FILTERS: { key: FilterType; label: string; icon: string }[] = [
  { key: 'all', label: 'All Jobs', icon: 'briefcase' },
  { key: 'recent', label: 'Recent', icon: 'time' },
  { key: 'applied', label: 'Applied', icon: 'checkmark-circle' },
  { key: 'saved', label: 'Saved', icon: 'bookmark' },
  { key: 'recommended', label: 'For You', icon: 'star' },
];

const HomeScreenModern: React.FC = () => {
  const dispatch = useAppDispatch();
  const { track } = useAnalytics();
  const { list: jobs, saved: savedJobs, status } = useAppSelector((state) => state.jobs);
  const profile = useAppSelector((state) => state.profile);
  const token = useAppSelector((state) => state.auth.token);
  const { data, isFetching, refetch } = useGetJobsQuery();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  // Get current hour for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    (async () => {
      const cached = await CacheService.get<Job[]>(CACHE_KEY);
      if (cached?.length) {
        dispatch(setJobs(cached));
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (data?.length) {
      dispatch(setJobs(data));
      CacheService.set(CACHE_KEY, data);
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchApplications();
      dispatch(fetchProfile());
      dispatch(fetchSavedJobs());
    }
  }, [token, dispatch]);

  const fetchStats = async () => {
    if (!token) return;
    try {
      const statsData = await jobSeekerApi.getDashboardStats(token);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchApplications = async () => {
    if (!token) return;
    try {
      const { applications } = await jobSeekerApi.getApplications(token);
      const appliedIds = new Set(applications.map(app => app.jobId));
      setAppliedJobIds(appliedIds);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const handleQuickApply = async (job: Job) => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please login to apply for jobs');
      return;
    }

    if (applyingJobId) return;

    track('job_quick_apply', { jobId: job.id });
    setApplyingJobId(job.id);

    try {
      await jobSeekerApi.applyForJob(token, parseInt(job.id));

      Alert.alert(
        'Application Submitted',
        `Your application for ${job.title} at ${job.company} has been submitted successfully!`,
        [
          { text: 'OK', style: 'default' },
        ]
      );

      // Add to applied set
      setAppliedJobIds(prev => new Set([...prev, parseInt(job.id)]));

      // Refresh stats and applications
      await fetchStats();
      await fetchApplications();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';
      Alert.alert('Application Failed', errorMessage, [{ text: 'OK' }]);
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setIsDetailsModalVisible(true);
    track('job_view_details', { jobId: job.id });
  };

  const onRefresh = async () => {
    dispatch(setStatus('loading'));
    await refetch();
    await fetchApplications();
    await dispatch(fetchSavedJobs());
  };

  // Filter and search jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Apply filter
    switch (selectedFilter) {
      case 'recent':
        filtered = [...jobs].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 20);
        break;
      case 'applied':
        filtered = jobs.filter(job => appliedJobIds.has(parseInt(job.id)));
        break;
      case 'saved':
        filtered = jobs.filter(job => savedJobs.includes(job.id));
        break;
      case 'recommended':
        filtered = jobs.filter(job => (job.matchScore || 0) >= 75);
        break;
      default:
        filtered = jobs;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        (job.location && job.location.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [jobs, selectedFilter, searchQuery, appliedJobIds, savedJobs]);

  const renderItem = ({ item }: { item: Job }) => (
    <JobCard
      job={item}
      onApply={() => handleQuickApply(item)}
      onSave={() => dispatch(toggleSavedJob(item.id))}
      onView={() => handleViewDetails(item)}
      isApplying={applyingJobId === item.id}
      hasApplied={appliedJobIds.has(parseInt(item.id))}
      isSaved={savedJobs.includes(item.id)}
    />
  );

  const WelcomeHeader = () => {
    const userName = profile.data?.user?.fullName || profile.data?.user?.firstName || 'Job Seeker';
    const userHeadline = profile.data?.profile?.headline;
    const profilePhotoUrl = profile.data?.profile?.profilePhotoUrl;
    const userInitials = profile.data?.user?.firstName?.charAt(0) + (profile.data?.user?.lastName?.charAt(0) || '');

    return (
      <View style={styles.welcomeContainer}>
        <FadeIn delay={0}>
          <View style={styles.greetingSection}>
            {profilePhotoUrl ? (
              <Avatar.Image
                size={56}
                source={{ uri: profilePhotoUrl }}
                style={styles.profilePhoto}
              />
            ) : (
              <Avatar.Text
                size={56}
                label={userInitials || 'JS'}
                style={styles.profilePhoto}
              />
            )}

            <View style={styles.greetingTextContainer}>
              <Text variant="bodyLarge" style={styles.greeting}>
                {getGreeting()}, {profile.data?.user?.firstName || 'there'}!
              </Text>
              <Text variant="headlineMedium" style={styles.userName}>
                {userName}
              </Text>
              {userHeadline && (
                <Text variant="bodyMedium" style={styles.userHeadline}>
                  {userHeadline}
                </Text>
              )}
            </View>

            <Pressable
              style={styles.notificationButton}
              onPress={() => track('notification_button_pressed')}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </Pressable>
          </View>
        </FadeIn>

        {/* Stats Cards */}
        <FadeIn delay={100}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statGradient}
              >
                <Ionicons name="briefcase-outline" size={20} color={colors.text} />
                <Text variant="headlineSmall" style={styles.statValue}>
                  {filteredJobs.length}
                </Text>
                <Text variant="bodySmall" style={styles.statLabel}>
                  Available
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={colors.gradientSecondary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statGradient}
              >
                <Ionicons name="send-outline" size={20} color={colors.background} />
                <Text variant="headlineSmall" style={[styles.statValue, { color: colors.background }]}>
                  {stats?.totalApplications || 0}
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: colors.background }]}>
                  Applied
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={colors.gradientAccent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statGradient}
              >
                <Ionicons name="chatbubbles-outline" size={20} color={colors.background} />
                <Text variant="headlineSmall" style={[styles.statValue, { color: colors.background }]}>
                  {stats?.interviews || 0}
                </Text>
                <Text variant="bodySmall" style={[styles.statLabel, { color: colors.background }]}>
                  Interviews
                </Text>
              </LinearGradient>
            </View>
          </View>
        </FadeIn>

        {/* Search Bar */}
        <FadeIn delay={200}>
          <Searchbar
            placeholder="Search jobs, companies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            icon={() => <Ionicons name="search" size={20} color={colors.textSecondary} />}
            clearIcon={() => searchQuery ? <Ionicons name="close-circle" size={20} color={colors.textSecondary} /> : null}
          />
        </FadeIn>

        {/* Filter Chips */}
        <FadeIn delay={300}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {FILTERS.map((filter) => (
              <Chip
                key={filter.key}
                selected={selectedFilter === filter.key}
                onPress={() => {
                  setSelectedFilter(filter.key);
                  track('filter_changed', { filter: filter.key });
                }}
                icon={() => (
                  <Ionicons
                    name={filter.icon as any}
                    size={16}
                    color={selectedFilter === filter.key ? colors.text : colors.textSecondary}
                  />
                )}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.key && styles.filterChipSelected,
                ]}
                textStyle={[
                  styles.filterChipText,
                  selectedFilter === filter.key && styles.filterChipTextSelected,
                ]}
              >
                {filter.label}
                {filter.key === 'applied' && appliedJobIds.size > 0 && (
                  <Text style={styles.filterBadge}> {appliedJobIds.size}</Text>
                )}
              </Chip>
            ))}
          </ScrollView>
        </FadeIn>

        {/* Results Count */}
        <View style={styles.resultsHeader}>
          <Text variant="titleMedium" style={styles.resultsText}>
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
          </Text>
          {selectedFilter !== 'all' && (
            <Pressable onPress={() => setSelectedFilter('all')}>
              <Text style={styles.clearFilter}>Clear filter</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {status === 'loading' && !jobs.length ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      ) : filteredJobs.length ? (
        <FlashList
          data={filteredJobs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          estimatedItemSize={320}
          refreshing={isFetching}
          onRefresh={onRefresh}
          ListHeaderComponent={<WelcomeHeader />}
          ListFooterComponent={<View style={styles.listFooter} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <>
          <WelcomeHeader />
          <View style={styles.emptyContainer}>
            <EmptyState
              title={searchQuery ? 'No jobs found' : 'No jobs available'}
              subtitle={
                searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for new opportunities'
              }
            />
          </View>
        </>
      )}

      <JobDetailsModal
        visible={isDetailsModalVisible}
        job={selectedJob}
        onClose={() => setIsDetailsModalVisible(false)}
        onApply={() => {
          if (selectedJob) {
            handleQuickApply(selectedJob);
            setIsDetailsModalVisible(false);
          }
        }}
        onSave={() => {
          if (selectedJob) {
            dispatch(toggleSavedJob(selectedJob.id));
          }
        }}
        isApplying={selectedJob ? applyingJobId === selectedJob.id : false}
        hasApplied={selectedJob ? appliedJobIds.has(parseInt(selectedJob.id)) : false}
        isSaved={selectedJob ? savedJobs.includes(selectedJob.id) : false}
      />
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
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  profilePhoto: {
    ...shadows.sm,
  },
  greetingTextContainer: {
    flex: 1,
  },
  greeting: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  userHeadline: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  notificationButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  statGradient: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statValue: {
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    color: colors.text,
    marginTop: 2,
    fontWeight: '500',
    fontSize: 12,
  },
  searchBar: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    elevation: 0,
    borderRadius: borderRadius.lg,
  },
  filtersContainer: {
    marginBottom: spacing.md,
  },
  filtersContent: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  filterBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  resultsText: {
    color: colors.text,
    fontWeight: '600',
  },
  clearFilter: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
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

export default HomeScreenModern;
