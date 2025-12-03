import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmployerHome from '@/screens/employer/dashboard/EmployerHome';
import QuickStats from '@/screens/employer/dashboard/QuickStats';
import RecentActivity from '@/screens/employer/dashboard/RecentActivity';

const Stack = createNativeStackNavigator();

export const EmployerDashboardStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="EmployerHome" component={EmployerHome} options={{ title: 'Dashboard' }} />
    <Stack.Screen name="QuickStats" component={QuickStats} options={{ title: 'Quick stats' }} />
    <Stack.Screen name="RecentActivity" component={RecentActivity} options={{ title: 'Recent activity' }} />
  </Stack.Navigator>
);
