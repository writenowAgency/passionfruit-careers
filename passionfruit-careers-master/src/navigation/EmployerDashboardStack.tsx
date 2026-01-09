import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployerHome from '@/screens/employer/dashboard/EmployerHome';
import QuickStats from '@/screens/employer/dashboard/QuickStats';
import RecentActivity from '@/screens/employer/dashboard/RecentActivity';
import EmployerProfileScreen from '@/screens/employer/profile/EmployerProfileScreen';
import CompanyProfileScreen from '@/screens/employer/profile/CompanyProfileScreen';
import ChangePasswordScreen from '@/screens/employer/profile/ChangePasswordScreen';
import NotificationPreferencesScreen from '@/screens/employer/profile/NotificationPreferencesScreen';
import PrivacySettingsScreen from '@/screens/employer/profile/PrivacySettingsScreen';
import HelpSupportScreen from '@/screens/employer/profile/HelpSupportScreen';
import TeamManagementScreen from '@/screens/employer/team/TeamManagementScreen';

const Stack = createNativeStackNavigator();

export const EmployerDashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="EmployerHome" component={EmployerHome} options={{ title: 'Dashboard' }} />
    <Stack.Screen name="QuickStats" component={QuickStats} options={{ title: 'Quick stats' }} />
    <Stack.Screen name="RecentActivity" component={RecentActivity} options={{ title: 'Recent activity' }} />
    <Stack.Screen name="EmployerProfile" component={EmployerProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} options={{ title: 'Company Profile' }} />
    <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />
    <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} options={{ title: 'Notification Preferences' }} />
    <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ title: 'Privacy Settings' }} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ title: 'Help & Support' }} />
    <Stack.Screen name="TeamManagement" component={TeamManagementScreen} options={{ title: 'Team Management' }} />
  </Stack.Navigator>
);
