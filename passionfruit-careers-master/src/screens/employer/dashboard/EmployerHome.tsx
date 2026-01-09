import React from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Dimensions, Pressable, Alert, RefreshControl } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { employerApi, DashboardStats, RecentApplicant, Activity } from '@/services/employerApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { ScaleUp } from '@/components/animations/ScaleUp';
import { SlideIn } from '@/components/animations/SlideIn';
import { EnhancedStatCard } from '@/components/cards/EnhancedStatCard';
import { ApplicantListItem } from '@/components/cards/ApplicantListItem';
import { QuickActionButton } from '@/components/common/QuickActionButton';
import { ActivityTimelineItem } from '@/components/cards/ActivityTimelineItem';
import { EmployerTabParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type DashboardStackParamList = {
  EmployerHome: undefined;
  QuickStats: undefined;
  RecentActivity: undefined;
  EmployerProfile: undefined;
};

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<DashboardStackParamList>,
  BottomTabNavigationProp<EmployerTabParamList>
>;

const EmployerHome: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [applicants, setApplicants] = React.useState<RecentApplicant[]>([]);
  const [recentActivities, setRecentActivities] = React.useState<Activity[]>([]);
  const [avgMatchScore, setAvgMatchScore] = React.useState(0);
  const [companyName, setCompanyName] = React.useState<string>('');

  React.useEffect(() => {
    fetchDashboardData();
  }, [token]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused: Refreshing dashboard data...');
      fetchDashboardData();
    }, [token])
  );

  const fetchDashboardData = async () => {
    console.log('fetchDashboardData called, token exists:', !!token);
    if (!token) {
      console.log('No token found, skipping API calls');
      return;
    }

    try {
      setLoading(true);

      console.log('Making API calls...');
      const [statsData, applicantsData, allApplicantsData, activityData, profileData] = await Promise.all([
        employerApi.getDashboardStats(token),
        employerApi.getRecentApplicants(token, 5),
        employerApi.getRecentApplicants(token, 100), // Get up to 100 applicants
        employerApi.getRecentActivity(token, 5),
        employerApi.getProfile(token),
      ]);

      console.log('=== API RESPONSES ===');
      console.log('Dashboard Stats:', JSON.stringify(statsData, null, 2));
      console.log('Recent Applicants:', JSON.stringify(applicantsData, null, 2));
      console.log('Profile Data:', JSON.stringify(profileData, null, 2));

      setStats(statsData);
      setApplicants(applicantsData.applicants);
      setRecentActivities(activityData.activities);
      setCompanyName(profileData.companyName || '');

      // Calculate average match score
      if (allApplicantsData.applicants.length > 0) {
        const totalScore = allApplicantsData.applicants.reduce(
          (acc, applicant) => acc + applicant.matchScore,
          0
        );
        const avg = Math.round(totalScore / allApplicantsData.applicants.length);
        setAvgMatchScore(avg);
      }
    } catch (error) {
      console.error('=== ERROR FETCHING DASHBOARD DATA ===');
      console.error('Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 12) greeting = 'Good Morning';
    else if (hour < 18) greeting = 'Good Afternoon';
    else greeting = 'Good Evening';

    // Add company name if available
    if (companyName) {
      return `${greeting}, ${companyName}`;
    }
    return greeting;
  };

  // Navigation handlers
  const handlePostJob = () => {
    navigation.navigate('EmployerJobs', {
      screen: 'ManageJobs',
      params: { openCreateModal: true },
    });
  };

  const handleViewApplications = () => {
    navigation.navigate('EmployerApplicants', { screen: 'Applicants', params: { filter: 'all' } });
  };

  const handleReviewPending = () => {
    console.log('Review Pending button clicked - navigating with filter: pending');
    navigation.navigate('EmployerApplicants', {
      screen: 'Applicants',
      params: { filter: 'pending' },
    });
  };

  const handleNavigateToAnalytics = () => {
    navigation.navigate('EmployerAnalytics', { screen: 'Analytics' });
  };

  const handleNavigateToJobs = () => {
    navigation.navigate('EmployerJobs', { screen: 'ManageJobs' });
  };

  const handleViewAllActivity = () => {
    navigation.navigate('RecentActivity');
  };

  const handleViewApplicantProfile = (applicantId: number) => {
    navigation.navigate('EmployerApplicants', {
      screen: 'ApplicantProfile',
      params: { applicantId },
    });
  };

  const handleNavigateToProfile = () => {
    navigation.navigate('EmployerProfile');
  };

  const handleNavigateToBilling = () => {
    navigation.navigate('EmployerCredits', { screen: 'Credits' });
  };

  const handleNavigateToTeam = () => {
    navigation.navigate('TeamManagement' as never);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  const pendingReviews = stats?.pendingReviews || 0;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Hero Section */}
      <FadeIn delay={0}>
        <LinearGradient
          colors={['#FFF9E6', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View>
              <Text variant="displaySmall" style={styles.heroTitle}>
                {getGreeting()}
              </Text>
              <Text variant="bodyLarge" style={styles.heroSubtitle}>
                {pendingReviews} applicant{pendingReviews !== 1 ? 's' : ''} waiting for review
              </Text>
            </View>
            <View style={styles.herIcon}>
              <Ionicons name="briefcase" size={40} color={colors.primary} />
            </View>
          </View>
        </LinearGradient>
      </FadeIn>

      {/* Quick Actions */}
      <FadeIn delay={100}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Quick Actions
                </Text>
                <Text variant="bodySmall" style={styles.sectionSubtitle}>
                  Manage your recruitment activities
                </Text>
              </View>
            </View>
            <View style={[styles.quickActionsGrid, isTablet && styles.quickActionsGridTablet]}>
              <SlideIn delay={50} style={styles.quickActionItem}>
                <QuickActionButton
                  icon="add-circle"
                  label="Post New Job"
                  variant="primary"
                  onPress={handlePostJob}
                />
              </SlideIn>
              <SlideIn delay={100} style={styles.quickActionItem}>
                <QuickActionButton
                  icon="checkmark-done"
                  label="Review Pending"
                  variant="secondary"
                  badge={pendingReviews}
                  onPress={handleReviewPending}
                />
              </SlideIn>
              <SlideIn delay={150} style={styles.quickActionItem}>
                <QuickActionButton
                  icon="people"
                  label="All Applicants"
                  variant="neutral"
                  onPress={handleViewApplications}
                />
              </SlideIn>
              <SlideIn delay={200} style={styles.quickActionItem}>
                <QuickActionButton
                  icon="bar-chart"
                  label="View Analytics"
                  variant="neutral"
                  onPress={handleNavigateToAnalytics}
                />
              </SlideIn>
              <SlideIn delay={250} style={styles.quickActionItem}>
                <QuickActionButton
                  icon="briefcase"
                  label="Manage Jobs"
                  variant="neutral"
                  onPress={handleNavigateToJobs}
                />
              </SlideIn>
              <SlideIn delay={300} style={styles.quickActionItem}>
                <QuickActionButton
                  icon="card"
                  label="Credits & Billing"
                  variant="neutral"
                  onPress={handleNavigateToBilling}
                />
              </SlideIn>
            </View>
          </Card.Content>
        </Card>
      </FadeIn>

      {/* Overview Stats */}
      <FadeIn delay={150}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Performance Overview
                </Text>
                <Text variant="bodySmall" style={styles.sectionSubtitle}>
                  Key metrics at a glance
                </Text>
              </View>
              <Pressable onPress={handleNavigateToAnalytics} style={styles.viewAllButton}>
                <Text style={styles.viewAllButtonText}>Details</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </Pressable>
            </View>
            <View style={[styles.statsGrid, isTablet && styles.statsGridTablet]}>
              <ScaleUp delay={100} style={styles.statCardWrapper}>
                <EnhancedStatCard
                  icon="document-text"
                  value={stats?.activeJobs || 0}
                  label="Active Jobs"
                  trend={stats?.jobGrowth}
                  progress={(stats?.activeJobs || 0) > 0 ? Math.min((stats?.activeJobs || 0) * 10, 100) : 0}
                  gradientColors={['#4F46E5', '#818CF8']}
                  onPress={handleNavigateToJobs}
                />
              </ScaleUp>
              <ScaleUp delay={150} style={styles.statCardWrapper}>
                <EnhancedStatCard
                  icon="people"
                  value={stats?.totalApplicants || 0}
                  label="Total Applicants"
                  trend={stats?.applicantGrowth}
                  progress={(stats?.totalApplicants || 0) > 0 ? Math.min((stats?.totalApplicants || 0) * 2, 100) : 0}
                  gradientColors={['#10B981', '#34D399']}
                  onPress={handleViewApplications}
                />
              </ScaleUp>
              <ScaleUp delay={200} style={styles.statCardWrapper}>
                <EnhancedStatCard
                  icon="time"
                  value={pendingReviews}
                  label="Pending Reviews"
                  progress={pendingReviews > 0 ? Math.min(pendingReviews * 10, 100) : 0}
                  gradientColors={['#F59E0B', '#FBBF24']}
                  onPress={handleReviewPending}
                />
              </ScaleUp>
              <ScaleUp delay={250} style={styles.statCardWrapper}>
                <EnhancedStatCard
                  icon="star"
                  value={`${avgMatchScore}%`}
                  label="Avg Match Score"
                  progress={avgMatchScore}
                  gradientColors={['#8B5CF6', '#A78BFA']}
                  onPress={handleNavigateToAnalytics}
                />
              </ScaleUp>
              <ScaleUp delay={300} style={styles.statCardWrapper}>
                <EnhancedStatCard
                  icon="trending-up"
                  value={stats?.recentApplicants || 0}
                  label="Recent (7 days)"
                  trend={stats?.applicantGrowth}
                  progress={(stats?.recentApplicants || 0) > 0 ? Math.min((stats?.recentApplicants || 0) * 5, 100) : 0}
                  gradientColors={['#06B6D4', '#22D3EE']}
                  onPress={handleViewApplications}
                />
              </ScaleUp>
              <ScaleUp delay={350} style={styles.statCardWrapper}>
                <EnhancedStatCard
                  icon="checkmark-circle"
                  value={stats?.totalApplicants ? Math.round(((stats.totalApplicants - pendingReviews) / stats.totalApplicants) * 100) : 0}
                  label="Reviewed Rate"
                  progress={stats?.totalApplicants ? Math.round(((stats.totalApplicants - pendingReviews) / stats.totalApplicants) * 100) : 0}
                  gradientColors={['#EC4899', '#F472B6']}
                  onPress={handleViewApplications}
                />
              </ScaleUp>
            </View>
          </Card.Content>
        </Card>
      </FadeIn>

      {/* Recent Applicants */}
      <FadeIn delay={200}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Recent Applicants
              </Text>
              <Ionicons name="time" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.applicantsList}>
              {applicants.length > 0 ? (
                applicants.slice(0, 5).map((applicant, index) => (
                  <SlideIn key={applicant.id} delay={index * 50}>
                    <ApplicantListItem
                      applicant={applicant}
                      onPress={() => handleViewApplicantProfile(applicant.id)}
                      showMatchScore={true}
                    />
                  </SlideIn>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
                  <Text variant="bodyLarge" style={styles.emptyStateText}>
                    No recent applications
                  </Text>
                  <Text variant="bodySmall" style={styles.emptyStateSubtext}>
                    Post a job to start receiving applications
                  </Text>
                  <Pressable
                    style={styles.emptyStateButton}
                    onPress={handlePostJob}
                  >
                    <Text style={styles.emptyStateButtonText}>Post a Job</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </FadeIn>

      {/* Activity Timeline */}
      <FadeIn delay={250}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Recent Activity
              </Text>
              <Ionicons name="pulse" size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.timelineContainer}>
              {recentActivities.map((activity, index) => (
                <ActivityTimelineItem
                  key={activity.id}
                  activity={activity}
                  isLast={index === recentActivities.length - 1}
                />
              ))}
            </View>
            <Pressable
              style={styles.viewAllLink}
              onPress={handleViewAllActivity}
            >
              <Text style={styles.viewAllLinkText}>View All Activity</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </Pressable>
          </Card.Content>
        </Card>
      </FadeIn>

      {/* Account Actions */}
      <FadeIn delay={300}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Account
            </Text>
            <View style={styles.accountActionsGrid}>
              <Pressable style={styles.accountAction} onPress={handleNavigateToProfile}>
                <Ionicons name="person" size={20} color={colors.primary} />
                <Text style={styles.accountActionText}>Profile</Text>
              </Pressable>
              <Pressable style={styles.accountAction} onPress={handleNavigateToBilling}>
                <Ionicons name="card" size={20} color={colors.secondary} />
                <Text style={styles.accountActionText}>Billing</Text>
              </Pressable>
              <Pressable style={styles.accountAction} onPress={handleNavigateToTeam}>
                <Ionicons name="people" size={20} color={colors.info} />
                <Text style={styles.accountActionText}>Team</Text>
              </Pressable>
              <Pressable
                style={[styles.accountAction, styles.logoutAction]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out" size={20} color={colors.error} />
                <Text style={[styles.accountActionText, styles.logoutText]}>
                  Log Out
                </Text>
              </Pressable>
            </View>
          </Card.Content>
        </Card>
      </FadeIn>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  heroCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    color: colors.textSecondary,
  },
  herIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(244, 224, 77, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  viewAllButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsContainer: {
    marginBottom: spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickActionItem: {
    width: '31%',
    minWidth: 100,
  },
  statsSection: {
    marginBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCardWrapper: {
    width: '31%',
    minWidth: 100,
  },
  card: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  applicantsList: {
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyStateButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  timelineContainer: {
    gap: spacing.xs,
  },
  viewAllLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    alignSelf: 'flex-end',
  },
  viewAllLinkText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  accountActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  accountAction: {
    width: '23%',
    minWidth: 70,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountActionText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 11,
    textAlign: 'center',
  },
  logoutAction: {
    backgroundColor: `${colors.error}10`,
  },
  logoutText: {
    color: colors.error,
  },
});

export default EmployerHome;
