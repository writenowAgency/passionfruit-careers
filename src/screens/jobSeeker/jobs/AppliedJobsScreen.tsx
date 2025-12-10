import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useAppSelector } from '@/store/hooks';
import { jobSeekerApi } from '@/services/jobSeekerApi';
import { JobCard } from '@/components/cards/JobCard';
import { EmptyState } from '@/components/common/EmptyState';
import { colors, spacing } from '@/theme';
import { Job, Application } from '@/types';

// We need to fetch the full job details for the applied jobs.
// This is a mock for now, in a real app the API should probably return full job objects.
const fetchJobDetails = async (jobId: number, token: string) => {
    // This is a placeholder. Ideally, you'd have a `getJobById` endpoint.
    // For now, we'll assume the job details are part of the application object or another endpoint.
    // Let's simulate a fetch.
    const response = await fetch(`http://localhost:3000/api/jobs/${jobId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch job details');
    }
    const data = await response.json();
    return data;
};


const AppliedJobsScreen = () => {
  const token = useAppSelector((state) => state.auth.token);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAppliedJobs = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { applications: fetchedApplications } = await jobSeekerApi.getApplications(token);
        setApplications(fetchedApplications);
        
        // Now fetch the details for each job
        const jobDetailsPromises = fetchedApplications.map(app => fetchJobDetails(app.jobId, token));
        const fetchedJobs = await Promise.all(jobDetailsPromises);
        
        setJobs(fetchedJobs);

      } catch (error) {
        console.error('Failed to load applied jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppliedJobs();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} color={colors.primary} />
        <Text style={{marginTop: 10}}>Loading Applied Jobs...</Text>
      </View>
    );
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No Applied Jobs"
        subtitle="Your applied jobs will appear here."
      />
    );
  }

  return (
    <FlatList
      data={jobs}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <JobCard
          job={item}
          hasApplied={true}
          onApply={() => {}}
          onSave={() => {}}
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

export default AppliedJobsScreen;