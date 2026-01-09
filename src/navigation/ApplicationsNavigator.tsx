import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ApplicationsScreen from '@/screens/jobSeeker/applications/ApplicationsScreen';
import ApplicationDetails from '@/screens/jobSeeker/applications/ApplicationDetails';
import ApplicationStatus from '@/screens/jobSeeker/applications/ApplicationStatus';

const Stack = createNativeStackNavigator();

export const ApplicationsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ApplicationsHome" component={ApplicationsScreen} options={{ title: 'Applications' }} />
    <Stack.Screen name="ApplicationDetails" component={ApplicationDetails} options={{ title: 'Details' }} />
    <Stack.Screen name="ApplicationStatus" component={ApplicationStatus} options={{ title: 'Status' }} />
  </Stack.Navigator>
);
