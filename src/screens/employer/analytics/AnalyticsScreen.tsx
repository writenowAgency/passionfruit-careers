import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Text, Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { ScaleUp } from '@/components/animations/ScaleUp';
import { SlideIn } from '@/components/animations/SlideIn';
import { MetricCard } from '@/components/cards/MetricCard';
import { FunnelChart, FunnelStage } from '@/components/charts/FunnelChart';
import { SimpleLineChart, DataPoint } from '@/components/charts/SimpleLineChart';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type TimePeriod = '7days' | '30days' | '90days' | 'all';

const EmployerAnalyticsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30days');

  // Mock data - replace with real API data
  const funnelData: FunnelStage[] = [
    { label: 'Views', value: 1204, color: colors.info },
    { label: 'Applications', value: 248, color: colors.primary },
    { label: 'Reviewed', value: 156, color: colors.secondary },
    { label: 'Interviews', value: 36, color: colors.accent },
    { label: 'Offers', value: 12, color: colors.success },
  ];

  const trendData: DataPoint[] = [
    { label: 'Week 1', value: 45 },
    { label: 'Week 2', value: 52 },
    { label: 'Week 3', value: 48 },
    { label: 'Week 4', value: 62 },
    { label: 'Week 5', value: 58 },
    { label: 'Week 6', value: 71 },
    { label: 'Week 7', value: 68 },
  ];

  const topJobs = [
    { title: 'Product Designer', applications: 92, avgMatch: 88, views: 342 },
    { title: 'Senior Developer', applications: 67, avgMatch: 85, views: 289 },
    { title: 'Marketing Manager', applications: 54, avgMatch: 82, views: 215 },
    { title: 'UX Researcher', applications: 35, avgMatch: 90, views: 178 },
  ];

  const applicantSources = [
    { source: 'Direct Application', count: 124, percentage: 50 },
    { source: 'LinkedIn', count: 62, percentage: 25 },
    { source: 'Indeed', count: 37, percentage: 15 },
    { source: 'Referral', count: 25, percentage: 10 },
  ];

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case '7days':
        return 'Last 7 days';
      case '30days':
        return 'Last 30 days';
      case '90days':
        return 'Last 90 days';
      case 'all':
        return 'All time';
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
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
            <View style={styles.heroText}>
              <Text variant="displaySmall" style={styles.heroTitle}>
                Analytics
              </Text>
              <Text variant="bodyLarge" style={styles.heroSubtitle}>
                Insights into your recruitment performance
              </Text>
            </View>
            <View style={styles.heroIcon}>
              <Ionicons name="bar-chart" size={36} color={colors.primary} />
            </View>
          </View>

          {/* Time Period Selector */}
          <View style={styles.periodSelector}>
            <Text variant="labelMedium" style={styles.periodLabel}>
              Time Period:
            </Text>
            <View style={styles.periodChips}>
              {(['7days', '30days', '90days', 'all'] as TimePeriod[]).map((period) => (
                <Chip
                  key={period}
                  selected={selectedPeriod === period}
                  onPress={() => setSelectedPeriod(period)}
                  style={[
                    styles.periodChip,
                    selectedPeriod === period && styles.periodChipSelected,
                  ]}
                  textStyle={styles.periodChipText}
                >
                  {period === '7days'
                    ? '7 Days'
                    : period === '30days'
                    ? '30 Days'
                    : period === '90days'
                    ? '90 Days'
                    : 'All Time'}
                </Chip>
              ))}
            </View>
          </View>
        </LinearGradient>
      </FadeIn>

      {/* Key Metrics */}
      <View style={styles.metricsSection}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Key Metrics
        </Text>
        <View style={[styles.metricsGrid, isTablet && styles.metricsGridTablet]}>
          <ScaleUp delay={50}>
            <MetricCard
              icon="eye"
              value="1,204"
              label="Total Views"
              trend={12}
              trendLabel="vs previous period"
              gradientColors={['#E3F2FD', colors.surface]}
            />
          </ScaleUp>
          <ScaleUp delay={100}>
            <MetricCard
              icon="people"
              value="248"
              label="Applications"
              trend={8}
              trendLabel="vs previous period"
              gradientColors={['#FFF9E6', colors.surface]}
            />
          </ScaleUp>
          <ScaleUp delay={150}>
            <MetricCard
              icon="trending-up"
              value="20.6%"
              label="Conversion Rate"
              trend={-2}
              trendLabel="vs previous period"
              gradientColors={['#FFE8F0', colors.surface]}
            />
          </ScaleUp>
          <ScaleUp delay={200}>
            <MetricCard
              icon="time"
              value="14 days"
              label="Avg Time to Hire"
              trend={5}
              trendLabel="vs previous period"
              gradientColors={['#E8F5E9', colors.surface]}
            />
          </ScaleUp>
        </View>
      </View>

      {/* Recruitment Funnel */}
      <FadeIn delay={100}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View>
                <Text variant="titleLarge" style={styles.cardTitle}>
                  Recruitment Funnel
                </Text>
                <Text variant="bodySmall" style={styles.cardSubtitle}>
                  Conversion at each stage ({getPeriodLabel()})
                </Text>
              </View>
              <Ionicons name="funnel" size={24} color={colors.primary} />
            </View>
            <View style={styles.chartContainer}>
              <FunnelChart stages={funnelData} />
            </View>
          </Card.Content>
        </Card>
      </FadeIn>

      {/* Application Trends */}
      <FadeIn delay={150}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View>
                <Text variant="titleLarge" style={styles.cardTitle}>
                  Application Trends
                </Text>
                <Text variant="bodySmall" style={styles.cardSubtitle}>
                  Weekly application volume
                </Text>
              </View>
              <Ionicons name="analytics" size={24} color={colors.secondary} />
            </View>
            <View style={styles.chartContainer}>
              <SimpleLineChart
                data={trendData}
                color={colors.primary}
                height={220}
                showDots={true}
                showGrid={true}
              />
            </View>
          </Card.Content>
        </Card>
      </FadeIn>

      {/* Top Performing Jobs */}
      <FadeIn delay={200}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View>
                <Text variant="titleLarge" style={styles.cardTitle}>
                  Top Performing Jobs
                </Text>
                <Text variant="bodySmall" style={styles.cardSubtitle}>
                  Highest engagement and match scores
                </Text>
              </View>
              <Ionicons name="trophy" size={24} color={colors.accent} />
            </View>
            <View style={styles.listContainer}>
              {topJobs.map((job, index) => (
                <SlideIn key={job.title} delay={index * 50}>
                  <Pressable style={styles.jobItem}>
                    <View style={styles.jobRank}>
                      <Text variant="titleMedium" style={styles.rankNumber}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.jobDetails}>
                      <Text variant="titleMedium" style={styles.jobTitle}>
                        {job.title}
                      </Text>
                      <View style={styles.jobStats}>
                        <View style={styles.jobStat}>
                          <Ionicons name="eye" size={14} color={colors.textSecondary} />
                          <Text variant="bodySmall" style={styles.jobStatText}>
                            {job.views}
                          </Text>
                        </View>
                        <View style={styles.jobStat}>
                          <Ionicons name="people" size={14} color={colors.textSecondary} />
                          <Text variant="bodySmall" style={styles.jobStatText}>
                            {job.applications}
                          </Text>
                        </View>
                        <View style={styles.jobStat}>
                          <Ionicons name="star" size={14} color={colors.accent} />
                          <Text variant="bodySmall" style={styles.jobStatText}>
                            {job.avgMatch}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </SlideIn>
              ))}
            </View>
          </Card.Content>
        </Card>
      </FadeIn>

      {/* Applicant Sources */}
      <FadeIn delay={250}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View>
                <Text variant="titleLarge" style={styles.cardTitle}>
                  Applicant Sources
                </Text>
                <Text variant="bodySmall" style={styles.cardSubtitle}>
                  Where your applicants come from
                </Text>
              </View>
              <Ionicons name="git-network" size={24} color={colors.info} />
            </View>
            <View style={styles.sourcesContainer}>
              {applicantSources.map((source, index) => (
                <SlideIn key={source.source} delay={index * 50}>
                  <View style={styles.sourceItem}>
                    <View style={styles.sourceHeader}>
                      <Text variant="titleSmall" style={styles.sourceLabel}>
                        {source.source}
                      </Text>
                      <Text variant="titleMedium" style={styles.sourceCount}>
                        {source.count}
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressBar, { width: `${source.percentage}%` }]}
                      />
                    </View>
                    <Text variant="bodySmall" style={styles.sourcePercentage}>
                      {source.percentage}% of total
                    </Text>
                  </View>
                </SlideIn>
              ))}
            </View>
          </Card.Content>
        </Card>
      </FadeIn>

      {/* Insights Card */}
      <FadeIn delay={300}>
        <Card style={styles.insightCard}>
          <Card.Content>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb" size={28} color={colors.warning} />
              <Text variant="titleMedium" style={styles.insightTitle}>
                Key Insights
              </Text>
            </View>
            <View style={styles.insightsList}>
              <View style={styles.insightItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text variant="bodyMedium" style={styles.insightText}>
                  Your conversion rate improved by 2% this month
                </Text>
              </View>
              <View style={styles.insightItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text variant="bodyMedium" style={styles.insightText}>
                  Product Designer has the highest match scores (88% avg)
                </Text>
              </View>
              <View style={styles.insightItem}>
                <Ionicons name="information-circle" size={20} color={colors.info} />
                <Text variant="bodyMedium" style={styles.insightText}>
                  Most applications come in on Tuesday and Wednesday
                </Text>
              </View>
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
    marginBottom: spacing.lg,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    color: colors.textSecondary,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(244, 224, 77, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodSelector: {
    gap: spacing.sm,
  },
  periodLabel: {
    color: colors.text,
    fontWeight: '600',
  },
  periodChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  periodChip: {
    backgroundColor: colors.background,
  },
  periodChipSelected: {
    backgroundColor: colors.primary,
  },
  periodChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricsGridTablet: {
    flexWrap: 'nowrap',
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
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chartContainer: {
    marginTop: spacing.md,
  },
  listContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  jobItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobRank: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    color: colors.background,
    fontWeight: '800',
  },
  jobDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  jobTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  jobStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  jobStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobStatText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sourcesContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  sourceItem: {
    gap: spacing.xs,
  },
  sourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceLabel: {
    color: colors.text,
    fontWeight: '600',
  },
  sourceCount: {
    color: colors.text,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.background,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.pill,
  },
  sourcePercentage: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: `${colors.warning}15`,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  insightTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  insightsList: {
    gap: spacing.md,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  insightText: {
    flex: 1,
    color: colors.text,
    fontWeight: '500',
  },
});

export default EmployerAnalyticsScreen;
