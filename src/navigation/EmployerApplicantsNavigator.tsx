import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployerApplicantsScreen from '@/screens/employer/applicants/ApplicantsScreen';
import EmployerApplicantProfile from '@/screens/employer/applicants/ApplicantProfile';
import ApplicantFilters from '@/screens/employer/applicants/ApplicantFilters';
import BulkActions from '@/screens/employer/applicants/BulkActions';
import ExportApplicants from '@/screens/employer/applicants/ExportApplicants';

const Stack = createNativeStackNavigator();

export const EmployerApplicantsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Applicants" component={EmployerApplicantsScreen} options={{ title: 'Applicants' }} />
    <Stack.Screen name="ApplicantProfile" component={EmployerApplicantProfile} options={{ title: 'Profile' }} />
    <Stack.Screen name="ApplicantFilters" component={ApplicantFilters} options={{ title: 'Filters' }} />
    <Stack.Screen name="BulkActions" component={BulkActions} options={{ title: 'Bulk actions' }} />
    <Stack.Screen name="ExportApplicants" component={ExportApplicants} options={{ title: 'Export' }} />
  </Stack.Navigator>
);
