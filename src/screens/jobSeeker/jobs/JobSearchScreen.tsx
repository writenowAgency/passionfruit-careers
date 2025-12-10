import React, { useState, useMemo, useEffect } from 'react';
import { SafeAreaView, View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Searchbar, SegmentedButtons, Button, ActivityIndicator, Chip, Text } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { JobCard } from '@/components/cards/JobCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSavedJob, setJobs, fetchSavedJobs } from '@/store/slices/jobsSlice';
import { Job } from '@/types';
import { useGetJobsQuery } from '@/store/api/apiSlice';
import { jobSeekerApi } from '@/services/jobSeekerApi';
import { JobDetailsModal } from '@/components/modals/JobDetailsModal';
import { FilterModal } from '@/components/modals/FilterModal';
import { colors, spacing } from '@/theme';
import MyJobsNavigator from '@/navigation/MyJobsNavigator';

type MainView = 'search' | 'my_jobs';

const JobSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  
  const { data: jobsData, isFetching, refetch } = useGetJobsQuery();
  const { list: allJobs, saved: savedJobs } = useAppSelector((state) => state.jobs);
  const token = useAppSelector((state) => state.auth.token);

  const [mainView, setMainView] = useState<MainView>('search');
  const [query, setQuery] = useState('');
  
  const [filters, setFilters] = useState({
    jobType: null,
    experienceLevel: null,
    datePosted: null,
  });

  const [isFilterModalVisible, setFilterModalVisible] = useState(false);

  // States for Job Details Modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailsModalVisible, setDetailsModalVisible] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (jobsData) {
      dispatch(setJobs(jobsData));
    }
  }, [jobsData, dispatch]);

  useEffect(() => {
    if (token) {
      fetchApplications();
      dispatch(fetchSavedJobs());
    }
  }, [token, dispatch]);


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
    if (!token) return;
    setApplyingJobId(job.id);
    try {
      await jobSeekerApi.applyForJob(token, parseInt(job.id));
      Alert.alert('Success', 'Your application has been submitted.');
      setAppliedJobIds(prev => new Set([...prev, parseInt(job.id)]));
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application.');
    } finally {
      setApplyingJobId(null);
    }
  };
  
  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setDetailsModalVisible(true);
  };
  
  const filteredJobs = useMemo(() => {
    let filtered = allJobs;
    // Apply search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(lowerQuery) || 
        job.company.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Apply filters from modal
    if (filters.jobType) {
      filtered = filtered.filter(job => job.jobType === filters.jobType);
    }
    if (filters.experienceLevel) {
      filtered = filtered.filter(job => job.experienceLevel === filters.experienceLevel);
    }
    if (filters.datePosted && filters.datePosted !== 'Anytime') {
      const now = new Date();
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.createdAt);
        const diffDays = (now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24);
        if (filters.datePosted === 'Past 24 hours') return diffDays <= 1;
        if (filters.datePosted === 'Past week') return diffDays <= 7;
        if (filters.datePosted === 'Past month') return diffDays <= 30;
        return true;
      });
    }

    return filtered;
  }, [allJobs, query, filters]);
  
  const activeFilters = Object.entries(filters).filter(([, value]) => value && value !== 'Anytime');

  // Helper to get display label for filter values
  const getFilterLabel = (key: string, value: string) => {
    if (key === 'jobType') {
      const labels: Record<string, string> = {
        'full-time': 'Full-time',
        'part-time': 'Part-time',
        'contract': 'Contract',
        'internship': 'Internship',
      };
      return labels[value] || value;
    }
    if (key === 'experienceLevel') {
      const labels: Record<string, string> = {
        'junior': 'Junior',
        'mid': 'Mid-level',
        'senior': 'Senior',
        'lead': 'Lead',
      };
      return labels[value] || value;
    }
    return value;
  };

  const renderActiveFilters = () => {
    if (activeFilters.length === 0) return null;

    return (
      <View style={styles.activeFiltersContainer}>
        <Text style={styles.activeFiltersTitle}>Active Filters:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {activeFilters.map(([key, value]) => (
            <Chip
              key={key}
              icon="close-circle"
              style={styles.activeFilterChip}
              onPress={() => setFilters(prev => ({...prev, [key]: null}))}
            >
              {getFilterLabel(key, value as string)}
            </Chip>
          ))}
          <Button mode="text" onPress={() => setFilters({jobType: null, experienceLevel: null, datePosted: null})}>Clear All</Button>
        </ScrollView>
      </View>
    );
  }

  const renderSearch = () => (
    <>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search jobs..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchBar}
        />
        <Button
          icon={() => <Ionicons name="filter" size={20} color={colors.primary} />}
          onPress={() => setFilterModalVisible(true)}
          style={styles.filterButton}
        >
          Filters
        </Button>
      </View>

      {renderActiveFilters()}
      
      {isFetching ? (
        <ActivityIndicator animating={true} color={colors.primary} size="large" style={{marginTop: 50}} />
      ) : (
        <FlashList
          data={filteredJobs}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              onApply={() => handleQuickApply(item)}
              onSave={() => dispatch(toggleSavedJob(item.id))}
              onView={() => handleViewDetails(item)}
              isApplying={applyingJobId === item.id}
              hasApplied={appliedJobIds.has(parseInt(item.id))}
              isSaved={savedJobs.includes(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          estimatedItemSize={280}
          ListEmptyComponent={<EmptyState title="No Jobs Found" subtitle="Try adjusting your search or filters." />}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isFetching}
        />
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <SegmentedButtons
          value={mainView}
          onValueChange={(value) => setMainView(value as MainView)}
          buttons={[
            { value: 'search', label: 'Job Search', icon: 'magnify' },
            { value: 'my_jobs', label: 'My Jobs', icon: 'briefcase-check' },
          ]}
          style={styles.mainTabs}
        />
      </View>
      
      {mainView === 'search' ? renderSearch() : <MyJobsNavigator />}

      <JobDetailsModal
        visible={isDetailsModalVisible}
        job={selectedJob}
        onClose={() => setDetailsModalVisible(false)}
        onApply={() => selectedJob && handleQuickApply(selectedJob)}
        onSave={() => selectedJob && dispatch(toggleSavedJob(selectedJob.id))}
        isApplying={selectedJob ? applyingJobId === selectedJob.id : false}
        hasApplied={selectedJob ? appliedJobIds.has(parseInt(selectedJob.id)) : false}
        isSaved={selectedJob ? savedJobs.includes(selectedJob.id) : false}
      />
      
      <FilterModal 
        visible={isFilterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        applyFilters={(f) => setFilters(f)}
        currentFilters={filters}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  mainTabs: {
  },
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
  },
  filterButton: {
    justifyContent: 'center',
  },
  activeFiltersContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  activeFiltersTitle: {
    marginBottom: spacing.sm,
    color: colors.textSecondary,
  },
  activeFilterChip: {
    marginRight: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  }
});

export default JobSearchScreen;