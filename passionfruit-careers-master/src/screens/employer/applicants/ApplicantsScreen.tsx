import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Dimensions, Pressable, Alert } from 'react-native';
import {
  Text,
  Card,
  ActivityIndicator,
  Searchbar,
  Chip,
  Menu,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { employerApi, RecentApplicant } from '@/services/employerApi';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { ScaleUp } from '@/components/animations/ScaleUp';
import { SlideIn } from '@/components/animations/SlideIn';
import { ApplicantListItem } from '@/components/cards/ApplicantListItem';
import { EmployerApplicantsStackParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type ApplicantStatus = 'all' | 'pending' | 'reviewed' | 'accepted' | 'rejected';
type SortBy = 'recent' | 'match_score' | 'name';

type EmployerApplicantsScreenRouteProp = RouteProp<EmployerApplicantsStackParamList, 'Applicants'>;
type EmployerApplicantsScreenNavigationProp = NativeStackNavigationProp<EmployerApplicantsStackParamList, 'Applicants'>;

const EmployerApplicantsScreen: React.FC = () => {
  const route = useRoute<EmployerApplicantsScreenRouteProp>();
  const navigation = useNavigation<EmployerApplicantsScreenNavigationProp>();
  const token = useAppSelector((state) => state.auth.token);

  const [applicants, setApplicants] = useState<RecentApplicant[]>([]);
  const [filteredApplicants, setFilteredApplicants] = useState<RecentApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  useEffect(() => {
    fetchApplicants();
  }, [token]);

  useEffect(() => {
    console.log('ApplicantsScreen - Route params:', route.params);
    if (route.params?.filter) {
      console.log('Setting filter to:', route.params.filter);
      setStatusFilter(route.params.filter as ApplicantStatus);
    }
  }, [route.params?.filter]);

  useEffect(() => {
    filterAndSortApplicants();
  }, [applicants, searchQuery, statusFilter, sortBy]);

  const fetchApplicants = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await employerApi.getRecentApplicants(token, 100);
      setApplicants(data.applicants);
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
      Alert.alert('Error', 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortApplicants = () => {
    let filtered = [...applicants];
    console.log('Filtering applicants - Total:', applicants.length, 'StatusFilter:', statusFilter);

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app) => app.status.toLowerCase() === statusFilter);
      console.log('After status filter:', filtered.length, 'applicants');
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.email.toLowerCase().includes(query) ||
          app.role.toLowerCase().includes(query) ||
          (app.jobTitle && app.jobTitle.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'match_score':
        filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
        break;
    }

    setFilteredApplicants(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplicants();
    setRefreshing(false);
  };

  const handleViewApplicantProfile = (applicantId: number) => {
    console.log('Navigating to applicant profile:', applicantId);
    navigation.navigate('ApplicantProfile', { applicantId });
  };

  const getApplicantStats = () => {
    const total = applicants.length;
    const pending = applicants.filter((a) => a.status === 'pending').length;
    const reviewed = applicants.filter((a) => a.status === 'reviewed').length;
    const accepted = applicants.filter((a) => a.status === 'accepted').length;
    const avgMatchScore = applicants.length > 0
      ? Math.round(applicants.reduce((sum, a) => sum + (a.matchScore || 0), 0) / applicants.length)
      : 0;

    return { total, pending, reviewed, accepted, avgMatchScore };
  };

  const stats = getApplicantStats();

  const getSortLabel = () => {
    switch (sortBy) {
      case 'match_score':
        return 'Match Score';
      case 'name':
        return 'Name';
      case 'recent':
      default:
        return 'Most Recent';
    }
  };

  const renderHeader = () => (
    <View>
      {/* Hero Section */}
      <FadeIn delay={0}>
        <LinearGradient
          colors={['#FFF9E6', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View style={{ flex: 1 }}>
              <Text variant="displaySmall" style={styles.heroTitle}>
                Applicants
              </Text>
              <Text variant="bodyLarge" style={styles.heroSubtitle}>
                {stats.total} total {stats.total === 1 ? 'applicant' : 'applicants'}
              </Text>
            </View>
            <View style={styles.heroActions}>
              <Pressable
                style={styles.pipelineButton}
                onPress={() => navigation.navigate('ApplicantPipeline' as never)}
              >
                <Ionicons name="grid" size={20} color={colors.primary} />
                <Text style={styles.pipelineButtonText}>Pipeline</Text>
              </Pressable>
              <View style={styles.heroIcon}>
                <Ionicons name="people" size={36} color={colors.primary} />
              </View>
            </View>
          </View>
        </LinearGradient>
      </FadeIn>

      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <View style={[styles.quickStatsGrid, isTablet && styles.quickStatsGridTablet]}>
          <ScaleUp delay={50}>
            <View style={styles.quickStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.warning}15` }]}>
                <Ionicons name="time" size={24} color={colors.warning} />
              </View>
              <View>
                <Text variant="headlineMedium" style={styles.quickStatValue}>
                  {stats.pending}
                </Text>
                <Text variant="bodySmall" style={styles.quickStatLabel}>
                  Pending
                </Text>
              </View>
            </View>
          </ScaleUp>

          <ScaleUp delay={100}>
            <View style={styles.quickStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.info}15` }]}>
                <Ionicons name="eye" size={24} color={colors.info} />
              </View>
              <View>
                <Text variant="headlineMedium" style={styles.quickStatValue}>
                  {stats.reviewed}
                </Text>
                <Text variant="bodySmall" style={styles.quickStatLabel}>
                  Reviewed
                </Text>
              </View>
            </View>
          </ScaleUp>

          <ScaleUp delay={150}>
            <View style={styles.quickStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
              <View>
                <Text variant="headlineMedium" style={styles.quickStatValue}>
                  {stats.accepted}
                </Text>
                <Text variant="bodySmall" style={styles.quickStatLabel}>
                  Accepted
                </Text>
              </View>
            </View>
          </ScaleUp>

          <ScaleUp delay={200}>
            <View style={styles.quickStatCard}>
              <View style={[styles.statIconContainer, { backgroundColor: `${colors.accent}15` }]}>
                <Ionicons name="star" size={24} color={colors.accent} />
              </View>
              <View>
                <Text variant="headlineMedium" style={styles.quickStatValue}>
                  {stats.avgMatchScore}%
                </Text>
                <Text variant="bodySmall" style={styles.quickStatLabel}>
                  Avg Match
                </Text>
              </View>
            </View>
          </ScaleUp>
        </View>
      </View>

      {/* Search and Filter */}
      <FadeIn delay={100}>
        <Card style={styles.filterCard}>
          <Card.Content>
            <Searchbar
              placeholder="Search applicants..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              iconColor={colors.primary}
            />

            <View style={styles.filterRow}>
              <View style={styles.filterChipsContainer}>
                <Text variant="labelMedium" style={styles.filterLabel}>
                  Status:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.filterChips}>
                    {(['all', 'pending', 'reviewed', 'accepted', 'rejected'] as ApplicantStatus[]).map(
                      (status) => (
                        <Chip
                          key={status}
                          selected={statusFilter === status}
                          onPress={() => setStatusFilter(status)}
                          style={[
                            styles.filterChip,
                            statusFilter === status && styles.filterChipSelected,
                          ]}
                          textStyle={styles.filterChipText}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Chip>
                      )
                    )}
                  </View>
                </ScrollView>
              </View>

              <Menu
                visible={sortMenuVisible}
                onDismiss={() => setSortMenuVisible(false)}
                anchor={
                  <Pressable
                    style={styles.sortButton}
                    onPress={() => setSortMenuVisible(true)}
                  >
                    <Ionicons name="funnel" size={18} color={colors.primary} />
                    <Text style={styles.sortButtonText}>{getSortLabel()}</Text>
                    <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                  </Pressable>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setSortBy('recent');
                    setSortMenuVisible(false);
                  }}
                  title="Most Recent"
                  leadingIcon="clock"
                />
                <Menu.Item
                  onPress={() => {
                    setSortBy('match_score');
                    setSortMenuVisible(false);
                  }}
                  title="Match Score"
                  leadingIcon="star"
                />
                <Menu.Item
                  onPress={() => {
                    setSortBy('name');
                    setSortMenuVisible(false);
                  }}
                  title="Name"
                  leadingIcon="alphabetical"
                />
              </Menu>
            </View>
          </Card.Content>
        </Card>
      </FadeIn>
    </View>
  );

  const renderEmptyState = () => (
    <FadeIn delay={200}>
      <Card style={styles.emptyCard}>
        <Card.Content style={styles.emptyContent}>
          <LinearGradient
            colors={[colors.primaryLight, colors.secondaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.emptyIconContainer}
          >
            <Ionicons name="people-outline" size={48} color={colors.text} />
          </LinearGradient>
          <Text variant="titleLarge" style={styles.emptyTitle}>
            {searchQuery || statusFilter !== 'all' ? 'No applicants found' : 'No applicants yet'}
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Applications will appear here when candidates apply to your jobs'}
          </Text>
        </Card.Content>
      </Card>
    </FadeIn>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading applicants...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={filteredApplicants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.listItemWrapper}>
            <ApplicantListItem
              applicant={item}
              onPress={() => handleViewApplicantProfile(item.id)}
              showMatchScore={true}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
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
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
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
  heroActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pipelineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.xs,
  },
  pipelineButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(244, 224, 77, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatsContainer: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  quickStatsGridTablet: {
    flexWrap: 'nowrap',
  },
  quickStatCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatValue: {
    color: colors.text,
    fontWeight: '700',
    lineHeight: 32,
  },
  quickStatLabel: {
    color: colors.textSecondary,
  },
  filterCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  searchbar: {
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  filterRow: {
    gap: spacing.md,
  },
  filterChipsContainer: {
    gap: spacing.sm,
  },
  filterLabel: {
    color: colors.text,
    fontWeight: '600',
  },
  filterChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filterChip: {
    backgroundColor: colors.background,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  listItemWrapper: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  emptyContent: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default EmployerApplicantsScreen;
