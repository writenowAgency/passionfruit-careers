import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '@/screens/jobSeeker/profile/ProfileScreen';
import EditProfileScreen from '@/screens/jobSeeker/profile/EditProfileScreen';
import SkillsManager from '@/screens/jobSeeker/profile/SkillsManager';
import DocumentsManager from '@/screens/jobSeeker/profile/DocumentsManager';
import CareerInsights from '@/screens/jobSeeker/profile/CareerInsights';
import ProfileStrengthMeter from '@/screens/jobSeeker/profile/ProfileStrengthMeter';
import PremiumScreen from '@/screens/jobSeeker/subscription/PremiumScreen';
import PaymentScreen from '@/screens/jobSeeker/subscription/PaymentScreen';
import SubscriptionStatus from '@/screens/jobSeeker/subscription/SubscriptionStatus';
import { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    <Stack.Screen name="SkillsManager" component={SkillsManager} options={{ title: 'Skills' }} />
    <Stack.Screen name="DocumentsManager" component={DocumentsManager} options={{ title: 'Documents' }} />
    <Stack.Screen name="CareerInsights" component={CareerInsights} options={{ title: 'Insights' }} />
    <Stack.Screen name="ProfileStrengthMeter" component={ProfileStrengthMeter} options={{ title: 'Strength' }} />
    <Stack.Screen name="Premium" component={PremiumScreen} options={{ title: 'Premium' }} />
    <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
    <Stack.Screen name="SubscriptionStatus" component={SubscriptionStatus} options={{ title: 'Subscription' }} />
  </Stack.Navigator>
);
