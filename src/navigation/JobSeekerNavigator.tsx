import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '@/screens/jobSeeker/dashboard/HomeScreen';
import { JobSeekerJobsNavigator } from './JobSeekerJobsNavigator';
import { ApplicationsNavigator } from './ApplicationsNavigator';
import { AIFeaturesNavigator } from './AIFeaturesNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { JobSeekerTabParamList } from './types';
import { colors } from '@/theme/colors';

const Tab = createBottomTabNavigator<JobSeekerTabParamList>();

const iconFor = (route: keyof JobSeekerTabParamList) => {
  switch (route) {
    case 'Home':
      return 'home';
    case 'Jobs':
      return 'briefcase';
    case 'Applications':
      return 'file-document';
    case 'AI':
      return 'robot';
    case 'Profile':
    default:
      return 'account-circle';
  }
};

export const JobSeekerNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name={iconFor(route.name as keyof JobSeekerTabParamList)} color={color} size={size} />
      ),
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Jobs" component={JobSeekerJobsNavigator} options={{ title: 'Jobs' }} />
    <Tab.Screen name="Applications" component={ApplicationsNavigator} />
    <Tab.Screen name="AI" component={AIFeaturesNavigator} options={{ title: 'AI' }} />
    <Tab.Screen name="Profile" component={ProfileNavigator} />
  </Tab.Navigator>
);
