import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JobSearchScreen from '@/screens/jobSeeker/jobs/JobSearchScreen';
import JobDetailsScreen from '@/screens/jobSeeker/jobs/JobDetailsScreen';
import SavedJobsScreen from '@/screens/jobSeeker/jobs/SavedJobsScreen';
import JobAlertSettings from '@/screens/jobSeeker/jobs/JobAlertSettings';
import { JobSeekerJobsStackParamList } from './types';

const Stack = createNativeStackNavigator<JobSeekerJobsStackParamList>();

export const JobSeekerJobsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="JobSearch"
      component={JobSearchScreen}
      options={{ title: 'Jobs' }}
    />
    <Stack.Screen
      name="JobDetails"
      component={JobDetailsScreen}
      options={{ title: 'Details' }}
    />
    <Stack.Screen
      name="SavedJobs"
      component={SavedJobsScreen}
      options={{ title: 'Saved jobs' }}
    />
    <Stack.Screen
      name="JobAlertSettings"
      component={JobAlertSettings}
      options={{ title: 'Alerts' }}
    />
  </Stack.Navigator>
);
