import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployerAnalyticsScreen from '@/screens/employer/analytics/AnalyticsScreen';
import JobPerformance from '@/screens/employer/analytics/JobPerformance';
import RecruitmentFunnel from '@/screens/employer/analytics/RecruitmentFunnel';

const Stack = createNativeStackNavigator();

export const EmployerAnalyticsNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Analytics" component={EmployerAnalyticsScreen} options={{ title: 'Analytics' }} />
    <Stack.Screen name="JobPerformance" component={JobPerformance} options={{ title: 'Job performance' }} />
    <Stack.Screen name="RecruitmentFunnel" component={RecruitmentFunnel} options={{ title: 'Recruitment funnel' }} />
  </Stack.Navigator>
);
