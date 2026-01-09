import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { JobCard } from '@/components/cards/JobCard';
import { EmptyState } from '@/components/common/EmptyState';
import { colors, spacing } from '@/theme';
import { Job } from '@/types';
import { useGetJobsQuery } from '@/store/api/apiSlice';
import { toggleSavedJob } from '@/store/slices/jobsSlice';

const SavedJobsScreen = () => {
  const dispatch = useAppDispatch();
  const { data: allJobs, isFetching } = useGetJobsQuery();
  const savedJobIds = useAppSelector((state) => state.jobs.saved);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (allJobs) {
      const filteredJobs = allJobs.filter(job => savedJobIds.includes(job.id));
      setSavedJobs(filteredJobs);
    }
  }, [allJobs, savedJobIds]);

  if (isFetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} color={colors.primary} />
        <Text style={{marginTop: 10}}>Loading Saved Jobs...</Text>
      </View>
    );
  }

  if (savedJobs.length === 0) {
    return (
      <EmptyState
        title="No Saved Jobs"
        subtitle="Your saved jobs will appear here."
      />
    );
  }

  return (
    <FlatList
      data={savedJobs}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <JobCard
          job={item}
          isSaved={true}
          onSave={() => dispatch(toggleSavedJob(item.id))}
          onApply={() => { /* Implement apply if needed */ }}
          onView={() => { /* Implement navigation to details if needed */ }}
        />
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.md,
  }
});

export default SavedJobsScreen;