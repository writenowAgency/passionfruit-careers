import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import SavedJobsScreen from '../screens/jobSeeker/jobs/SavedJobsScreen';
import AppliedJobsScreen from '../screens/jobSeeker/jobs/AppliedJobsScreen';
import { colors } from '@/theme';

const Tab = createMaterialTopTabNavigator();

const MyJobsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIndicatorStyle: {
          backgroundColor: colors.primary,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
        },
      }}
    >
      <Tab.Screen name="Saved" component={SavedJobsScreen} />
      <Tab.Screen name="Applied" component={AppliedJobsScreen} />
    </Tab.Navigator>
  );
};

export default MyJobsNavigator;
