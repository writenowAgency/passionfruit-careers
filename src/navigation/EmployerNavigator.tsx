import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmployerDashboardStack } from './EmployerDashboardStack';
import { EmployerJobsNavigator } from './EmployerJobsNavigator';
import { EmployerApplicantsNavigator } from './EmployerApplicantsNavigator';
import { EmployerAnalyticsNavigator } from './EmployerAnalyticsNavigator';
import { EmployerCreditsNavigator } from './EmployerCreditsNavigator';
import { EmployerTabParamList } from './types';
import { colors } from '@/theme/colors';

const Tab = createBottomTabNavigator<EmployerTabParamList>();

const iconFor = (route: keyof EmployerTabParamList) => {
  switch (route) {
    case 'EmployerHome':
      return 'view-dashboard';
    case 'EmployerJobs':
      return 'playlist-plus';
    case 'EmployerApplicants':
      return 'account-group';
    case 'EmployerAnalytics':
      return 'chart-bar';
    case 'EmployerCredits':
    default:
      return 'credit-card';
  }
};

export const EmployerNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name={iconFor(route.name as keyof EmployerTabParamList)} color={color} size={size} />
      ),
    })}
  >
    <Tab.Screen name="EmployerHome" component={EmployerDashboardStack} options={{ title: 'Home' }} />
    <Tab.Screen name="EmployerJobs" component={EmployerJobsNavigator} options={{ title: 'Jobs' }} />
    <Tab.Screen name="EmployerApplicants" component={EmployerApplicantsNavigator} options={{ title: 'Applicants' }} />
    <Tab.Screen name="EmployerAnalytics" component={EmployerAnalyticsNavigator} options={{ title: 'Analytics' }} />
    <Tab.Screen name="EmployerCredits" component={EmployerCreditsNavigator} options={{ title: 'Credits' }} />
  </Tab.Navigator>
);
