import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PostJobWizard from '@/screens/employer/jobs/PostJobWizard';
import JobBasicInfo from '@/screens/employer/jobs/JobBasicInfo';
import EmployerJobDetails from '@/screens/employer/jobs/JobDetails';
import JobRequirements from '@/screens/employer/jobs/JobRequirements';
import JobSettings from '@/screens/employer/jobs/JobSettings';
import ManageJobsScreen from '@/screens/employer/jobs/ManageJobsScreen';
import BulkImportScreen from '@/screens/employer/jobs/BulkImportScreen';
import EmployerJobAnalytics from '@/screens/employer/jobs/JobAnalytics';

const Stack = createNativeStackNavigator();

export const EmployerJobsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ManageJobs" component={ManageJobsScreen} options={{ title: 'Jobs' }} />
    <Stack.Screen name="PostJobWizard" component={PostJobWizard} options={{ title: 'Post job' }} />
    <Stack.Screen name="JobBasicInfo" component={JobBasicInfo} options={{ title: 'Basics' }} />
    <Stack.Screen name="EmployerJobDetails" component={EmployerJobDetails} options={{ title: 'Details' }} />
    <Stack.Screen name="JobRequirements" component={JobRequirements} options={{ title: 'Requirements' }} />
    <Stack.Screen name="JobSettings" component={JobSettings} options={{ title: 'Settings' }} />
    <Stack.Screen name="BulkImport" component={BulkImportScreen} options={{ title: 'Bulk import' }} />
    <Stack.Screen name="EmployerJobAnalytics" component={EmployerJobAnalytics} options={{ title: 'Analytics' }} />
  </Stack.Navigator>
);
