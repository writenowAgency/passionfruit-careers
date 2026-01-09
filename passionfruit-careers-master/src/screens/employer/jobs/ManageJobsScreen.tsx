import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, Dimensions, Pressable, Platform } from 'react-native';
import {
  Text,
  Card,
  FAB,
  Portal,
  Modal,
  TextInput,
  Chip,
  ActivityIndicator,
  Searchbar,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, RouteProp } from '@react-navigation/native';
import { employerApi, Job } from '@/services/employerApi';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { ScaleUp } from '@/components/animations/ScaleUp';
import { SlideIn } from '@/components/animations/SlideIn';
import { EmployerJobCard } from '@/components/cards/EmployerJobCard';
import { QuickActionButton } from '@/components/common/QuickActionButton';
import { EmployerJobsStackParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type JobStatus = 'all' | 'published' | 'draft' | 'closed';

type ManageJobsScreenRouteProp = RouteProp<EmployerJobsStackParamList, 'ManageJobs'>;

const ManageJobsScreen: React.FC = () => {
  const route = useRoute<ManageJobsScreenRouteProp>();
  const token = useAppSelector((state) => state.auth.token);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus>('all');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState<string>('full-time');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<string>('mid');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [token]);

  useEffect(() => {
    if (route.params?.openCreateModal) {
      openCreateModal();
    }
  }, [route.params?.openCreateModal]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchQuery, statusFilter]);

  const fetchJobs = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const { jobs: fetchedJobs } = await employerApi.getJobs(token);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      if (Platform.OS === 'web') {
        alert('Failed to load jobs');
      } else {
        Alert.alert('Error', 'Failed to load jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          (job.location && job.location.toLowerCase().includes(query)) ||
          (job.job_type && job.job_type.toLowerCase().includes(query))
      );
    }

    setFilteredJobs(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingJob(null);
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setRequirements(job.requirements || '');
    setLocation(job.location || '');
    setJobType(job.job_type || 'full-time');
    setSalaryMin(job.salary_min || '');
    setSalaryMax(job.salary_max || '');
    setExperienceLevel(job.experience_level || 'mid');
    setModalVisible(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setRequirements('');
    setLocation('');
    setJobType('full-time');
    setSalaryMin('');
    setSalaryMax('');
    setExperienceLevel('mid');
  };

  const handleSubmit = async () => {
    if (!token) return;

    if (!title.trim() || !description.trim()) {
      if (Platform.OS === 'web') {
        alert('Please fill in title and description');
      } else {
        Alert.alert('Error', 'Please fill in title and description');
      }
      return;
    }

    try {
      setSubmitting(true);

      const jobData = {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim() || undefined,
        location: location.trim() || undefined,
        job_type: jobType,
        salary_min: salaryMin ? parseInt(salaryMin) : undefined,
        salary_max: salaryMax ? parseInt(salaryMax) : undefined,
        salary_currency: 'ZAR',
        experience_level: experienceLevel,
        status: 'published',
      };

      if (editingJob) {
        await employerApi.updateJob(token, editingJob.id, jobData);
        if (Platform.OS === 'web') {
          alert('Job updated successfully!');
        } else {
          Alert.alert('Success', 'Job updated successfully!');
        }
      } else {
        await employerApi.createJob(token, jobData);
        if (Platform.OS === 'web') {
          alert('Job created successfully!');
        } else {
          Alert.alert('Success', 'Job created successfully!');
        }
      }

      setModalVisible(false);
      resetForm();
      await fetchJobs();
    } catch (error) {
      console.error('Failed to save job:', error);
      if (Platform.OS === 'web') {
        alert('Failed to save job. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to save job. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId: number, jobTitle: string) => {
    if (!token) return;

    // Use native browser confirm for web, Alert for mobile
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Are you sure you want to delete "${jobTitle}"?`);
      if (confirmed) {
        try {
          await employerApi.deleteJob(token, jobId);
          alert('Job deleted successfully');
          await fetchJobs();
        } catch (error) {
          console.error('Failed to delete job:', error);
          alert('Failed to delete job');
        }
      }
    } else {
      Alert.alert(
        'Delete Job',
        `Are you sure you want to delete "${jobTitle}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await employerApi.deleteJob(token, jobId);
                Alert.alert('Success', 'Job deleted successfully');
                await fetchJobs();
              } catch (error) {
                console.error('Failed to delete job:', error);
                Alert.alert('Error', 'Failed to delete job');
              }
            },
          },
        ]
      );
    }
  };

  const getJobStats = () => {
    const total = jobs.length;
    const published = jobs.filter((j) => j.status === 'published').length;
    const draft = jobs.filter((j) => j.status === 'draft').length;
    const totalViews = jobs.reduce((sum, j) => sum + (j.views_count || 0), 0);
    const totalApplications = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);

    return { total, published, draft, totalViews, totalApplications };
  };

  const stats = getJobStats();

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading your jobs...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
              <View>
                <Text variant="displaySmall" style={styles.heroTitle}>
                  Manage Jobs
                </Text>
                <Text variant="bodyLarge" style={styles.heroSubtitle}>
                  {stats.total} active {stats.total === 1 ? 'position' : 'positions'}
                </Text>
              </View>
              <View style={styles.heroIcon}>
                <Ionicons name="briefcase" size={36} color={colors.primary} />
              </View>
            </View>
          </LinearGradient>
        </FadeIn>

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <View style={[styles.quickStatsGrid, isTablet && styles.quickStatsGridTablet]}>
            <ScaleUp delay={50}>
              <View style={styles.quickStatCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${colors.success}15` }]}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                </View>
                <View>
                  <Text variant="headlineMedium" style={styles.quickStatValue}>
                    {stats.published}
                  </Text>
                  <Text variant="bodySmall" style={styles.quickStatLabel}>
                    Published
                  </Text>
                </View>
              </View>
            </ScaleUp>

            <ScaleUp delay={100}>
              <View style={styles.quickStatCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${colors.warning}15` }]}>
                  <Ionicons name="document-text" size={24} color={colors.warning} />
                </View>
                <View>
                  <Text variant="headlineMedium" style={styles.quickStatValue}>
                    {stats.draft}
                  </Text>
                  <Text variant="bodySmall" style={styles.quickStatLabel}>
                    Drafts
                  </Text>
                </View>
              </View>
            </ScaleUp>

            <ScaleUp delay={150}>
              <View style={styles.quickStatCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${colors.info}15` }]}>
                  <Ionicons name="eye" size={24} color={colors.info} />
                </View>
                <View>
                  <Text variant="headlineMedium" style={styles.quickStatValue}>
                    {stats.totalViews}
                  </Text>
                  <Text variant="bodySmall" style={styles.quickStatLabel}>
                    Total Views
                  </Text>
                </View>
              </View>
            </ScaleUp>

            <ScaleUp delay={200}>
              <View style={styles.quickStatCard}>
                <View style={[styles.statIconContainer, { backgroundColor: `${colors.secondary}15` }]}>
                  <Ionicons name="people" size={24} color={colors.secondary} />
                </View>
                <View>
                  <Text variant="headlineMedium" style={styles.quickStatValue}>
                    {stats.totalApplications}
                  </Text>
                  <Text variant="bodySmall" style={styles.quickStatLabel}>
                    Applications
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
                placeholder="Search jobs..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
                iconColor={colors.primary}
              />

              <View style={styles.filterChipsContainer}>
                <Text variant="labelMedium" style={styles.filterLabel}>
                  Filter by status:
                </Text>
                <View style={styles.filterChips}>
                  {(['all', 'published', 'draft', 'closed'] as JobStatus[]).map((status) => (
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
                  ))}
                </View>
              </View>
            </Card.Content>
          </Card>
        </FadeIn>

        {/* Jobs List or Empty State */}
        {filteredJobs.length === 0 ? (
          <FadeIn delay={200}>
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <LinearGradient
                  colors={[colors.primaryLight, colors.secondaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.emptyIconContainer}
                >
                  <Ionicons name="briefcase-outline" size={48} color={colors.text} />
                </LinearGradient>
                <Text variant="titleLarge" style={styles.emptyTitle}>
                  {searchQuery || statusFilter !== 'all' ? 'No jobs found' : 'No jobs yet'}
                </Text>
                <Text variant="bodyMedium" style={styles.emptyText}>
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first job posting to start receiving applications'}
                </Text>
                {!searchQuery && statusFilter === 'all' && (
                  <Pressable style={styles.emptyButton} onPress={openCreateModal}>
                    <Ionicons name="add-circle" size={20} color={colors.background} />
                    <Text style={styles.emptyButtonText}>Create First Job</Text>
                  </Pressable>
                )}
              </Card.Content>
            </Card>
          </FadeIn>
        ) : (
          <View style={[styles.jobsGrid, isTablet && styles.jobsGridTablet]}>
            {filteredJobs.map((job, index) => (
              <SlideIn key={job.id} delay={index * 50}>
                <EmployerJobCard
                  job={job}
                  onPress={() => console.log('View job details', job.id)}
                  onEdit={() => openEditModal(job)}
                  onDelete={() => handleDelete(job.id, job.title)}
                  onViewApplicants={() => console.log('View applicants', job.id)}
                />
              </SlideIn>
            ))}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openCreateModal}
        label={isTablet ? 'Create Job' : undefined}
        color={colors.background}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              {editingJob ? 'Edit Job' : 'Create New Job'}
            </Text>

            <TextInput
              label="Job Title *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Description *"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
            />

            <TextInput
              label="Requirements"
              value={requirements}
              onChangeText={setRequirements}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              style={styles.input}
              placeholder="e.g. Cape Town, WC or Remote"
            />

            <Text variant="labelLarge" style={styles.label}>
              Job Type
            </Text>
            <View style={styles.chipGroup}>
              {['full-time', 'part-time', 'contract', 'remote'].map((type) => (
                <Chip
                  key={type}
                  selected={jobType === type}
                  onPress={() => setJobType(type)}
                  style={styles.chip}
                >
                  {type}
                </Chip>
              ))}
            </View>

            <Text variant="labelLarge" style={styles.label}>
              Experience Level
            </Text>
            <View style={styles.chipGroup}>
              {['junior', 'mid', 'senior', 'lead'].map((level) => (
                <Chip
                  key={level}
                  selected={experienceLevel === level}
                  onPress={() => setExperienceLevel(level)}
                  style={styles.chip}
                >
                  {level}
                </Chip>
              ))}
            </View>

            <View style={styles.salaryRow}>
              <TextInput
                label="Min Salary (ZAR)"
                value={salaryMin}
                onChangeText={setSalaryMin}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.salaryInput]}
                placeholder="900000"
              />
              <TextInput
                label="Max Salary (ZAR)"
                value={salaryMax}
                onChangeText={setSalaryMax}
                mode="outlined"
                keyboardType="numeric"
                style={[styles.input, styles.salaryInput]}
                placeholder="1800000"
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    {editingJob ? 'Update' : 'Create'}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </Modal>
      </Portal>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
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
  quickStatsContainer: {
    marginBottom: spacing.lg,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickStatsGridTablet: {
    flexWrap: 'nowrap',
  },
  quickStatCard: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
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
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  searchbar: {
    backgroundColor: colors.background,
    marginBottom: spacing.md,
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
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  jobsGrid: {
    gap: spacing.md,
  },
  jobsGridTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
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
    marginBottom: spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.md,
  },
  emptyButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  modal: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    margin: spacing.lg,
    borderRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    marginRight: 0,
  },
  salaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  salaryInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  modalSubmitButton: {
    backgroundColor: colors.primary,
  },
  modalSubmitText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ManageJobsScreen;
