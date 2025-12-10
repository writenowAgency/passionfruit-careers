import React from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatCard } from '@/components/cards/StatCard';
import { employerApi, DashboardStats, RecentApplicant } from '@/services/employerApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';

const EmployerHome: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [applicants, setApplicants] = React.useState<RecentApplicant[]>([]);

  React.useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const [statsData, applicantsData] = await Promise.all([
        employerApi.getDashboardStats(token),
        employerApi.getRecentApplicants(token, 3),
      ]);

      setStats(statsData);
      setApplicants(applicantsData.applicants);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Welcome Header */}
      <FadeIn delay={0}>
        <View style={styles.header}>
          <View>
            <Text variant="headlineLarge" style={styles.title}>
              Recruitment Dashboard
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Manage your hiring pipeline
            </Text>
          </View>
          <Ionicons name="briefcase" size={32} color={colors.primary} />
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
            <Ionicons name="document-text" size={32} color={colors.text} />
            <Text variant="displaySmall" style={styles.statValue}>
              {stats?.activeJobs || 0}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Active Jobs
            </Text>
            <View style={styles.trendBadge}>
              <Ionicons name="trending-up" size={12} color={colors.success} />
              <Text style={styles.trendText}>+{stats?.jobGrowth || 0}%</Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={colors.gradientSecondary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <Ionicons name="people" size={32} color={colors.background} />
            <Text variant="displaySmall" style={[styles.statValue, { color: colors.background }]}>
              {stats?.totalApplicants || 0}
            </Text>
            <Text variant="bodyMedium" style={[styles.statLabel, { color: colors.background }]}>
              Total Applicants
            </Text>
            <View style={[styles.trendBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons
                name={stats?.applicantGrowth && stats.applicantGrowth >= 0 ? "trending-up" : "trending-down"}
                size={12}
                color={colors.background}
              />
              <Text style={[styles.trendText, { color: colors.background }]}>
                {stats?.applicantGrowth >= 0 ? '+' : ''}{stats?.applicantGrowth || 0}
              </Text>
            </View>
          </LinearGradient>
        </View>
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
                applicants.map((applicant) => (
                  <View key={applicant.id} style={styles.applicantItem}>
                    <View style={styles.applicantAvatar}>
                      <Text style={styles.applicantInitials}>
                        {applicant.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.applicantInfo}>
                      <Text variant="titleMedium" style={styles.applicantName}>
                        {applicant.name}
                      </Text>
                      <Text variant="bodySmall" style={styles.applicantRole}>
                        {applicant.role}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: colors.textSecondary, padding: spacing.lg }}>
                  No recent applicants
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      </FadeIn>

      {/* Account Section */}
      <FadeIn delay={300}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Account
            </Text>
            <Button
              mode="contained"
              onPress={handleLogout}
              buttonColor={colors.error}
              icon="logout"
              style={styles.logoutButton}
              contentStyle={styles.logoutButtonContent}
              labelStyle={styles.logoutButtonLabel}
            >
              Log Out
            </Button>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.md,
  },
  statValue: {
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    color: colors.text,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: borderRadius.pill,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  card: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
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
  applicantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  applicantAvatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicantInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    color: colors.text,
    fontWeight: '600',
  },
  applicantRole: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  logoutButtonContent: {
    paddingVertical: spacing.sm,
  },
  logoutButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmployerHome;
