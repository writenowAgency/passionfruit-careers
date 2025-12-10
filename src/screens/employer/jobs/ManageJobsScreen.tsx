import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import {
  Text,
  Card,
  Button,
  FAB,
  Portal,
  Modal,
  TextInput,
  Chip,
  ActivityIndicator,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { employerApi, Job } from '@/services/employerApi';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing, borderRadius, shadows } from '@/theme';

const ManageJobsScreen: React.FC = () => {
  const token = useAppSelector((state) => state.auth.token);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

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

  const fetchJobs = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const { jobs: fetchedJobs } = await employerApi.getJobs(token);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
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
      Alert.alert('Error', 'Please fill in title and description');
      return;
    }

    try {
      setSubmitting(true);

      const jobData = {
        title: title.trim(),
        description: description.trim(),
        requirements: requirements.trim() || undefined,
        location: location.trim() || undefined,
        jobType,
        salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
        salaryCurrency: 'ZAR',
        experienceLevel,
        status: 'published',
      };

      if (editingJob) {
        await employerApi.updateJob(token, editingJob.id, jobData);
        Alert.alert('Success', 'Job updated successfully!');
      } else {
        await employerApi.createJob(token, jobData);
        Alert.alert('Success', 'Job created successfully!');
      }

      setModalVisible(false);
      resetForm();
      await fetchJobs(); // Refresh the list
    } catch (error) {
      console.error('Failed to save job:', error);
      Alert.alert('Error', 'Failed to save job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (jobId: number, jobTitle: string) => {
    if (!token) return;

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
  };

  const formatSalaryValue = (value: string) => {
    const num = parseInt(value);
    if (num >= 1000000) {
      const millions = num / 1000000;
      return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
    } else {
      const thousands = num / 1000;
      return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(0)}k`;
    }
  };

  const formatSalary = (min: string | null, max: string | null, currency: string | null) => {
    if (!min && !max) return 'Salary not specified';
    const symbol = (currency || 'ZAR') === 'ZAR' ? 'R' : currency;
    if (min && max) return `${symbol}${formatSalaryValue(min)} - ${symbol}${formatSalaryValue(max)}`;
    if (min) return `From ${symbol}${formatSalaryValue(min)}`;
    if (max) return `Up to ${symbol}${formatSalaryValue(max)}`;
    return '';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Manage Jobs
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} posted
          </Text>
        </View>

        {jobs.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="briefcase-outline" size={64} color={colors.textSecondary} />
              <Text variant="titleLarge" style={styles.emptyTitle}>
                No jobs yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Create your first job posting to start receiving applications
              </Text>
              <Button
                mode="contained"
                onPress={openCreateModal}
                style={styles.emptyButton}
                icon="plus"
              >
                Create First Job
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <View style={styles.jobsList}>
            {jobs.map((job) => (
              <Card key={job.id} style={styles.jobCard}>
                <Card.Content>
                  <View style={styles.jobHeader}>
                    <View style={styles.jobTitleContainer}>
                      <Text variant="titleLarge" style={styles.jobTitle}>
                        {job.title}
                      </Text>
                      <Chip
                        mode="flat"
                        style={[
                          styles.statusChip,
                          job.status === 'published' ? styles.publishedChip : styles.draftChip,
                        ]}
                        textStyle={styles.chipText}
                      >
                        {job.status}
                      </Chip>
                    </View>
                  </View>

                  <View style={styles.jobDetails}>
                    {job.location && (
                      <View style={styles.detailRow}>
                        <Ionicons name="location" size={16} color={colors.textSecondary} />
                        <Text variant="bodyMedium" style={styles.detailText}>
                          {job.location}
                        </Text>
                      </View>
                    )}

                    {job.job_type && (
                      <View style={styles.detailRow}>
                        <Ionicons name="time" size={16} color={colors.textSecondary} />
                        <Text variant="bodyMedium" style={styles.detailText}>
                          {job.job_type}
                        </Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Ionicons name="cash" size={16} color={colors.textSecondary} />
                      <Text variant="bodyMedium" style={styles.detailText}>
                        {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
                      </Text>
                    </View>

                    {job.experience_level && (
                      <View style={styles.detailRow}>
                        <Ionicons name="school" size={16} color={colors.textSecondary} />
                        <Text variant="bodyMedium" style={styles.detailText}>
                          {job.experience_level} level
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.stat}>
                      <Ionicons name="eye" size={16} color={colors.textSecondary} />
                      <Text variant="bodySmall" style={styles.statText}>
                        {job.views_count} views
                      </Text>
                    </View>
                    <View style={styles.stat}>
                      <Ionicons name="people" size={16} color={colors.textSecondary} />
                      <Text variant="bodySmall" style={styles.statText}>
                        {job.applications_count} applications
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actions}>
                    <Button
                      mode="outlined"
                      onPress={() => openEditModal(job)}
                      style={styles.actionButton}
                      icon="pencil"
                    >
                      Edit
                    </Button>
                    <Button
                      mode="text"
                      onPress={() => handleDelete(job.id, job.title)}
                      textColor={colors.error}
                      icon="delete"
                    >
                      Delete
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={openCreateModal}
        label="Create Job"
        color={colors.background}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
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
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.modalButton}
                loading={submitting}
                disabled={submitting}
              >
                {editingJob ? 'Update' : 'Create'}
              </Button>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
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
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  emptyContent: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    color: colors.text,
    marginTop: spacing.lg,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    borderRadius: borderRadius.md,
  },
  jobsList: {
    gap: spacing.md,
  },
  jobCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  jobHeader: {
    marginBottom: spacing.md,
  },
  jobTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  jobTitle: {
    color: colors.text,
    fontWeight: '700',
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  publishedChip: {
    backgroundColor: colors.success + '20',
  },
  draftChip: {
    backgroundColor: colors.textSecondary + '20',
  },
  chipText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  jobDetails: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
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
  },
});

export default ManageJobsScreen;
