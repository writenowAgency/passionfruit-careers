import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Text, Card, ProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { ScaleUp } from '@/components/animations/ScaleUp';
import { SlideIn } from '@/components/animations/SlideIn';
import { CircularProgress } from '@/components/common/CircularProgress';
import { CreditPackageCard, CreditPackage } from '@/components/cards/CreditPackageCard';
import { TransactionItem, Transaction } from '@/components/cards/TransactionItem';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const CreditsScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'packages' | 'history'>('packages');

  // Mock data - replace with real API data
  const currentBalance = 128;
  const creditsUsedThisMonth = 72;
  const creditsLimit = 200;
  const percentageUsed = (creditsUsedThisMonth / creditsLimit) * 100;

  const packages: CreditPackage[] = [
    {
      id: '1',
      name: 'Starter',
      credits: 50,
      price: 499,
      currency: 'ZAR',
      features: [
        'Post up to 5 jobs',
        'View applicant profiles',
        'Basic analytics',
        'Email support',
      ],
    },
    {
      id: '2',
      name: 'Professional',
      credits: 150,
      price: 1299,
      currency: 'ZAR',
      popular: true,
      savings: '15%',
      features: [
        'Post up to 15 jobs',
        'Advanced applicant matching',
        'Full analytics dashboard',
        'Priority support',
        'Custom branding',
      ],
    },
    {
      id: '3',
      name: 'Enterprise',
      credits: 500,
      price: 3999,
      currency: 'ZAR',
      savings: '25%',
      features: [
        'Unlimited job postings',
        'AI-powered matching',
        'Custom integrations',
        '24/7 dedicated support',
        'Advanced reporting',
        'Multi-user access',
      ],
    },
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'usage',
      description: 'Job Posted',
      details: 'Senior Developer position',
      amount: 10,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'usage',
      description: 'Premium Job Boost',
      details: 'Product Designer listing',
      amount: 5,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'purchase',
      description: 'Credits Purchase',
      details: 'Professional Package',
      amount: 150,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'usage',
      description: 'Applicant Contact',
      details: 'Downloaded resume',
      amount: 2,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'usage',
      description: 'Job Posted',
      details: 'Marketing Manager position',
      amount: 10,
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const usageBreakdown = [
    { label: 'Job Postings', credits: 40, color: colors.primary },
    { label: 'Premium Features', credits: 20, color: colors.secondary },
    { label: 'Applicant Contacts', credits: 12, color: colors.info },
  ];

  const handlePurchase = (pkg: CreditPackage) => {
    console.log('Purchase package:', pkg.name);
    // Implement purchase logic
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section with Balance */}
      <FadeIn delay={0}>
        <LinearGradient
          colors={['#FFF9E6', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <Text variant="titleMedium" style={styles.heroLabel}>
                Available Credits
              </Text>
              <View style={styles.balanceRow}>
                <Ionicons name="diamond" size={48} color={colors.primary} />
                <Text variant="displayLarge" style={styles.balanceValue}>
                  {currentBalance.toLocaleString()}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.heroSubtitle}>
                {creditsLimit - creditsUsedThisMonth} credits remaining this month
              </Text>
            </View>
            <View style={styles.circularProgressContainer}>
              <CircularProgress
                percentage={percentageUsed}
                size={120}
                strokeWidth={12}
                color={colors.primary}
              />
              <View style={styles.progressLabel}>
                <Text variant="headlineSmall" style={styles.progressValue}>
                  {Math.round(percentageUsed)}%
                </Text>
                <Text variant="bodySmall" style={styles.progressText}>
                  used
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Ionicons name="trending-down" size={20} color={colors.info} />
              <View>
                <Text variant="titleMedium" style={styles.quickStatValue}>
                  {creditsUsedThisMonth}
                </Text>
                <Text variant="bodySmall" style={styles.quickStatLabel}>
                  Used this month
                </Text>
              </View>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Ionicons name="calendar" size={20} color={colors.secondary} />
              <View>
                <Text variant="titleMedium" style={styles.quickStatValue}>
                  {creditsLimit}
                </Text>
                <Text variant="bodySmall" style={styles.quickStatLabel}>
                  Monthly limit
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </FadeIn>

      {/* Usage Breakdown */}
      <FadeIn delay={50}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Text variant="titleLarge" style={styles.cardTitle}>
                Credit Usage Breakdown
              </Text>
              <Ionicons name="pie-chart" size={24} color={colors.primary} />
            </View>
            <View style={styles.usageBreakdown}>
              {usageBreakdown.map((item, index) => (
                <SlideIn key={item.label} delay={index * 50}>
                  <View style={styles.usageItem}>
                    <View style={styles.usageHeader}>
                      <View style={styles.usageLabel}>
                        <View
                          style={[styles.usageDot, { backgroundColor: item.color }]}
                        />
                        <Text variant="titleSmall" style={styles.usageText}>
                          {item.label}
                        </Text>
                      </View>
                      <Text variant="titleMedium" style={styles.usageValue}>
                        {item.credits} credits
                      </Text>
                    </View>
                    <ProgressBar
                      progress={item.credits / creditsUsedThisMonth}
                      color={item.color}
                      style={styles.usageProgressBar}
                    />
                  </View>
                </SlideIn>
              ))}
            </View>
          </Card.Content>
        </Card>
      </FadeIn>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, selectedTab === 'packages' && styles.tabActive]}
          onPress={() => setSelectedTab('packages')}
        >
          <Ionicons
            name="diamond"
            size={20}
            color={selectedTab === 'packages' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'packages' && styles.tabTextActive,
            ]}
          >
            Purchase Credits
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, selectedTab === 'history' && styles.tabActive]}
          onPress={() => setSelectedTab('history')}
        >
          <Ionicons
            name="receipt"
            size={20}
            color={selectedTab === 'history' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              selectedTab === 'history' && styles.tabTextActive,
            ]}
          >
            Transaction History
          </Text>
        </Pressable>
      </View>

      {/* Packages Tab */}
      {selectedTab === 'packages' && (
        <View style={styles.packagesContainer}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Choose Your Package
          </Text>
          <View style={[styles.packagesGrid, isTablet && styles.packagesGridTablet]}>
            {packages.map((pkg, index) => (
              <ScaleUp key={pkg.id} delay={index * 100}>
                <CreditPackageCard package={pkg} onPress={() => handlePurchase(pkg)} />
              </ScaleUp>
            ))}
          </View>

          {/* Info Card */}
          <FadeIn delay={300}>
            <Card style={styles.infoCard}>
              <Card.Content>
                <View style={styles.infoHeader}>
                  <Ionicons name="information-circle" size={28} color={colors.info} />
                  <Text variant="titleMedium" style={styles.infoTitle}>
                    How Credits Work
                  </Text>
                </View>
                <View style={styles.infoList}>
                  <View style={styles.infoItem}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text variant="bodyMedium" style={styles.infoText}>
                      Credits never expire - use them at your own pace
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text variant="bodyMedium" style={styles.infoText}>
                      Job postings cost 10 credits, premium features vary
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                    <Text variant="bodyMedium" style={styles.infoText}>
                      Larger packages offer better value per credit
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          </FadeIn>
        </View>
      )}

      {/* History Tab */}
      {selectedTab === 'history' && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Recent Transactions
            </Text>
            <Pressable style={styles.filterButton}>
              <Ionicons name="filter" size={18} color={colors.primary} />
              <Text style={styles.filterText}>Filter</Text>
            </Pressable>
          </View>

          <View style={styles.transactionsList}>
            {transactions.map((transaction, index) => (
              <SlideIn key={transaction.id} delay={index * 50}>
                <TransactionItem transaction={transaction} />
              </SlideIn>
            ))}
          </View>

          {transactions.length === 0 && (
            <FadeIn delay={100}>
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={64} color={colors.textTertiary} />
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  No transactions yet
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  Your credit purchases and usage will appear here
                </Text>
              </View>
            </FadeIn>
          )}
        </View>
      )}
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
    marginBottom: spacing.lg,
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
    gap: spacing.xs,
  },
  heroLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  balanceValue: {
    color: colors.text,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  circularProgressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressValue: {
    color: colors.text,
    fontWeight: '800',
  },
  progressText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  quickStatValue: {
    color: colors.text,
    fontWeight: '700',
  },
  quickStatLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
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
  usageBreakdown: {
    gap: spacing.md,
  },
  usageItem: {
    gap: spacing.sm,
  },
  usageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usageLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  usageDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.pill,
  },
  usageText: {
    color: colors.text,
    fontWeight: '600',
  },
  usageValue: {
    color: colors.text,
    fontWeight: '700',
  },
  usageProgressBar: {
    height: 6,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  tabActive: {
    backgroundColor: colors.background,
    ...shadows.sm,
  },
  tabText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  packagesContainer: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  packagesGrid: {
    gap: spacing.lg,
  },
  packagesGridTablet: {
    flexDirection: 'row',
  },
  infoCard: {
    backgroundColor: `${colors.info}10`,
    borderRadius: borderRadius.xl,
    marginTop: spacing.lg,
    ...shadows.sm,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  infoList: {
    gap: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    color: colors.text,
    fontWeight: '500',
  },
  historyContainer: {
    gap: spacing.md,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  transactionsList: {
    gap: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptyText: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

export default CreditsScreen;
