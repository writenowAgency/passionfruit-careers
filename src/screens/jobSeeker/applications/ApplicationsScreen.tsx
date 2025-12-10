import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text, ActivityIndicator, Surface, ProgressBar, Chip, Searchbar, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { jobSeekerApi, Application } from '@/services/jobSeekerApi';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import ApplicationDetailsModal from '@/components/modals/ApplicationDetailsModal';

type FilterType = 'all' | 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'rejected' | 'withdrawn';

interface FilterOption {
  value: FilterType;
  label: string;
  icon: string;
  count?: number;
}

/**
 * Modern ApplicationsScreen with improved UI/UX
 *
 * Features:
 * - Beautiful gradient header
 * - Filter tabs by status
 * - Search functionality
 * - Stats overview
 * - Modern card design
 * - Empty state illustration
 * - Pull to refresh
 */
const ApplicationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const token = useAppSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [token]);

  useEffect(() => {
    applyFilters();
  }, [applications, activeFilter, searchQuery]);

  const fetchApplications = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await jobSeekerApi.getApplications(token);
      setApplications(data.applications || []);
    } catch (error) {
      console.error('[ApplicationsScreen] Failed to fetch:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplications();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...applications];

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(
        (app) => app.status.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.jobTitle.toLowerCase().includes(query) ||
          app.company.toLowerCase().includes(query) ||
          app.location?.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const getStatusCounts = (): Record<FilterType, number> => {
    const counts: Record<FilterType, number> = {
      all: applications.length,
      pending: 0,
      reviewed: 0,
      shortlisted: 0,
      interview: 0,
      rejected: 0,
      withdrawn: 0,
    };

    applications.forEach((app) => {
      const status = app.status.toLowerCase() as FilterType;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });

    return counts;
  };

  // View application details
  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setModalVisible(true);
  };

  // Withdraw application
  const handleWithdrawApplication = async (applicationId: number) => {
    console.log('[ApplicationsScreen] handleWithdrawApplication called with ID:', applicationId);

    if (!token) {
      console.log('[ApplicationsScreen] No token available');
      return;
    }

    try {
      setWithdrawing(true);
      console.log('[ApplicationsScreen] Calling withdraw API...');

      // Call API
      await jobSeekerApi.withdrawApplication(token, applicationId);
      console.log('[ApplicationsScreen] API call successful');

      // Update local state optimistically
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: 'withdrawn' } : app
        )
      );

      // Close modal first
      setModalVisible(false);
      setSelectedApplication(null);

      // Show success message
      console.log('[ApplicationsScreen] Showing success snackbar');
      setSnackbarMessage('Application Withdrawn');
      setSnackbarVisible(true);

      // Refresh applications to show updated status
      await fetchApplications();
    } catch (error) {
      console.error('[ApplicationsScreen] Withdraw error:', error);
      const message = error instanceof Error ? error.message : 'Failed to withdraw application';

      // Show error in snackbar instead of Alert
      setSnackbarMessage(message);
      setSnackbarVisible(true);
    } finally {
      setWithdrawing(false);
      console.log('[ApplicationsScreen] Withdrawal process complete');
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
      case 'interview':
        return colors.success;
      case 'rejected':
        return colors.error;
      case 'reviewed':
        return colors.info;
      case 'pending':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return 'checkmark-circle';
      case 'interview':
        return 'people';
      case 'rejected':
        return 'close-circle';
      case 'reviewed':
        return 'eye';
      case 'pending':
        return 'time';
      default:
        return 'document-text';
    }
  };

  const getProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 0.25;
      case 'reviewed':
        return 0.5;
      case 'shortlisted':
        return 0.75;
      case 'interview':
        return 0.9;
      case 'rejected':
        return 1;
      default:
        return 0.25;
    }
  };

  const formatSalary = (min: string | null, max: string | null, currency: string | null) => {
    if (!min && !max) return null;

    const formatValue = (value: string) => {
      const num = parseInt(value);
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      }
      return `${(num / 1000).toFixed(0)}k`;
    };

    const symbol = currency === 'ZAR' ? 'R' : currency || 'R';
    if (min && max) return `${symbol}${formatValue(min)} - ${formatValue(max)}`;
    if (min) return `From ${symbol}${formatValue(min)}`;
    if (max) return `Up to ${symbol}${formatValue(max)}`;
    return null;
  };

  const statusCounts = getStatusCounts();

  const filters: FilterOption[] = [
    { value: 'all', label: 'All', icon: 'apps', count: statusCounts.all },
    { value: 'pending', label: 'Pending', icon: 'time', count: statusCounts.pending },
    { value: 'reviewed', label: 'Reviewed', icon: 'eye', count: statusCounts.reviewed },
    { value: 'shortlisted', label: 'Shortlisted', icon: 'star', count: statusCounts.shortlisted },
    { value: 'interview', label: 'Interview', icon: 'people', count: statusCounts.interview },
    { value: 'rejected', label: 'Rejected', icon: 'close', count: statusCounts.rejected },
    { value: 'withdrawn', label: 'Withdrawn', icon: 'arrow-undo', count: statusCounts.withdrawn },
  ];

  // Loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your applications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Applications</Text>
          <Text style={styles.headerSubtitle}>
            Track your job application progress
          </Text>

          {/* Stats Badge */}
          <View style={styles.statsBadge}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{applications.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {statusCounts.shortlisted + statusCounts.interview}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {statusCounts.pending}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      {applications.length > 0 && (
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search by job title, company, or location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
            iconColor={colors.primary}
            inputStyle={styles.searchInput}
          />
        </View>
      )}

      {/* Filter Tabs */}
      {applications.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScrollView}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <Pressable
                key={filter.value}
                onPress={() => setActiveFilter(filter.value)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={16}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[styles.filterLabel, isActive && styles.filterLabelActive]}
                >
                  {filter.label}
                </Text>
                {filter.count !== undefined && filter.count > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      isActive && styles.filterBadgeActive,
                    ]}
                  >
                    <Text style={[styles.filterBadgeText, isActive && styles.filterBadgeTextActive]}>
                      {filter.count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Applications List */}
      <View style={styles.content}>
        {filteredApplications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name={searchQuery ? 'search' : applications.length === 0 ? 'briefcase-outline' : 'funnel-outline'}
                size={64}
                color={colors.textSecondary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery
                ? 'No matching applications'
                : applications.length === 0
                ? 'No applications yet'
                : 'No applications in this category'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try adjusting your search terms'
                : applications.length === 0
                ? 'Start applying for jobs to see them here'
                : 'Try selecting a different filter'}
            </Text>
          </View>
        ) : (
          <FlashList
            data={filteredApplications}
            keyExtractor={(item) => item.id.toString()}
            refreshing={refreshing}
            onRefresh={onRefresh}
            estimatedItemSize={200}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleViewApplication(item)}
              >
                <Surface style={styles.applicationCard} elevation={1}>
                  {/* Header: Title and Status */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.jobTitle} numberOfLines={2}>
                        {item.jobTitle}
                      </Text>
                      <Text style={styles.company} numberOfLines={1}>
                        {item.company}
                      </Text>
                      {(item.jobStatus === 'closed' || item.jobStatus === 'draft') && (
                        <Chip
                          mode="flat"
                          icon="lock-closed"
                          textStyle={styles.closedChipTextSmall}
                          style={styles.closedChipSmall}
                        >
                          Job Closed
                        </Chip>
                      )}
                    </View>
                    <Chip
                      mode="flat"
                      icon={getStatusIcon(item.status) as any}
                      textStyle={[
                        styles.statusChipText,
                        { color: getStatusColor(item.status) },
                      ]}
                      style={[
                        styles.statusChip,
                        { backgroundColor: `${getStatusColor(item.status)}15` },
                      ]}
                    >
                      {item.status}
                    </Chip>
                  </View>

                  {/* Job Description */}
                  {item.jobDescription && (
                    <View style={styles.descriptionSection}>
                      <Text style={styles.descriptionText} numberOfLines={3}>
                        {item.jobDescription}
                      </Text>
                    </View>
                  )}

                  {/* Key Requirements */}
                  {item.requirements && (
                    <View style={styles.requirementsSection}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="checkmark-done" size={16} color={colors.primary} />
                        <Text style={styles.sectionHeaderText}>Requirements</Text>
                      </View>
                      <Text style={styles.requirementsText} numberOfLines={3}>
                        {item.requirements}
                      </Text>
                    </View>
                  )}

                  {/* Responsibilities */}
                  {item.responsibilities && (
                    <View style={styles.responsibilitiesSection}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="list" size={16} color={colors.info} />
                        <Text style={styles.sectionHeaderText}>Responsibilities</Text>
                      </View>
                      <Text style={styles.responsibilitiesText} numberOfLines={2}>
                        {item.responsibilities}
                      </Text>
                    </View>
                  )}

                  {/* Benefits */}
                  {item.benefits && (
                    <View style={styles.benefitsSection}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="gift" size={16} color={colors.success} />
                        <Text style={styles.sectionHeaderText}>Benefits</Text>
                      </View>
                      <Text style={styles.benefitsText} numberOfLines={2}>
                        {item.benefits}
                      </Text>
                    </View>
                  )}

                  {/* Company Info */}
                  {item.companyDescription && (
                    <View style={styles.companySection}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="business" size={16} color={colors.primary} />
                        <Text style={styles.sectionHeaderText}>About {item.company}</Text>
                      </View>
                      <Text style={styles.companyText} numberOfLines={2}>
                        {item.companyDescription}
                      </Text>
                    </View>
                  )}

                  {/* Details */}
                  <View style={styles.cardDetails}>
                    {item.location && (
                      <View style={styles.detailRow}>
                        <Ionicons name="location" size={14} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{item.location}</Text>
                      </View>
                    )}
                    {formatSalary(item.salaryMin, item.salaryMax, item.salaryCurrency) && (
                      <View style={styles.detailRow}>
                        <Ionicons name="cash" size={14} color={colors.textSecondary} />
                        <Text style={styles.detailText}>
                          {formatSalary(item.salaryMin, item.salaryMax, item.salaryCurrency)}
                        </Text>
                      </View>
                    )}
                    {item.jobType && (
                      <View style={styles.detailRow}>
                        <Ionicons name="briefcase" size={14} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{item.jobType}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Ionicons name="calendar" size={14} color={colors.textSecondary} />
                      <Text style={styles.detailText}>
                        Applied {new Date(item.appliedAt).toLocaleDateString('en-ZA', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Section */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Application Progress</Text>
                      {item.matchScore && (
                        <View style={styles.matchBadge}>
                          <Ionicons name="analytics" size={12} color={colors.primary} />
                          <Text style={styles.matchText}>{item.matchScore}% match</Text>
                        </View>
                      )}
                    </View>
                    <ProgressBar
                      progress={getProgress(item.status)}
                      color={getStatusColor(item.status)}
                      style={styles.progressBar}
                    />
                  </View>
                </Surface>
              </Pressable>
            )}
          />
        )}
      </View>

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        visible={modalVisible}
        application={selectedApplication}
        onClose={() => {
          setModalVisible(false);
          setSelectedApplication(null);
        }}
        onWithdraw={handleWithdrawApplication}
        withdrawing={withdrawing}
      />

      {/* Success Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
          textColor: '#fff',
        }}
        style={[
          styles.snackbar,
          { backgroundColor: snackbarMessage.includes('Withdrawn') ? '#22c55e' : colors.error }
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons
            name={snackbarMessage.includes('Withdrawn') ? 'checkmark-circle' : 'alert-circle'}
            size={20}
            color="#fff"
          />
          <Text style={{ color: '#fff', fontWeight: '600' }}>{snackbarMessage}</Text>
        </View>
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Header Styles
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.text,
    opacity: 0.8,
    marginBottom: spacing.md,
  },

  // Stats Badge
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.pill,
    ...shadows.md,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },

  // Search Bar
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },

  // Filter Tabs
  filtersScrollView: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  filterBadge: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: colors.primary,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterBadgeTextActive: {
    color: colors.background,
  },

  // Content Area
  content: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Application Card
  applicationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  cardTitleContainer: {
    flex: 1,
  },

  // Job Description Section
  descriptionSection: {
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  descriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Requirements Section
  requirementsSection: {
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceVariant,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  requirementsText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Responsibilities Section
  responsibilitiesSection: {
    marginBottom: spacing.md,
    backgroundColor: colors.info + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  responsibilitiesText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Benefits Section
  benefitsSection: {
    marginBottom: spacing.md,
    backgroundColor: colors.success + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  benefitsText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  // Company Section
  companySection: {
    marginBottom: spacing.md,
    backgroundColor: colors.primaryLight + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  companyText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },

  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  company: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusChip: {
    height: 32,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Card Details
  cardDetails: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Progress Section
  progressSection: {
    marginTop: spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  matchText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceVariant,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Job Closed Chip (Small)
  closedChipSmall: {
    height: 24,
    backgroundColor: colors.surfaceVariant,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  closedChipTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // Snackbar
  snackbar: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
  },
});

export default ApplicationsScreen;
