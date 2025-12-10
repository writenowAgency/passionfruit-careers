import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '@/screens/jobSeeker/profile/ProfileScreen';
import EditProfileScreen from '@/screens/jobSeeker/profile/EditProfileScreen';
import SkillsManager from '@/screens/jobSeeker/profile/SkillsManager';
import ExperienceManager from '@/screens/jobSeeker/profile/ExperienceManager';
import EducationManager from '@/screens/jobSeeker/profile/EducationManager';
import CertificationsManager from '@/screens/jobSeeker/profile/CertificationsManager';
import LanguagesManager from '@/screens/jobSeeker/profile/LanguagesManager';
import CareerObjectivesEditor from '@/screens/jobSeeker/profile/CareerObjectivesEditor';
import { DocumentsManagerScreen } from '@/screens/jobSeeker/profile/DocumentsManagerScreen';
import { PreferencesManagerScreen } from '@/screens/jobSeeker/profile/PreferencesManagerScreen';
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
    <Stack.Screen name="SkillsManager" component={SkillsManager} options={{ title: 'Manage Skills' }} />
    <Stack.Screen name="ExperienceManager" component={ExperienceManager} options={{ title: 'Manage Experience' }} />
    <Stack.Screen name="EducationManager" component={EducationManager} options={{ title: 'Manage Education' }} />
    <Stack.Screen name="CertificationsManager" component={CertificationsManager} options={{ title: 'Manage Certifications' }} />
    <Stack.Screen name="LanguagesManager" component={LanguagesManager} options={{ title: 'Manage Languages' }} />
    <Stack.Screen name="CareerObjectivesEditor" component={CareerObjectivesEditor} options={{ title: 'Career Objectives' }} />
    <Stack.Screen name="DocumentsManager" component={DocumentsManagerScreen} options={{ title: 'Manage Documents' }} />
    <Stack.Screen name="PreferencesManager" component={PreferencesManagerScreen} options={{ title: 'Job Preferences' }} />
    <Stack.Screen name="CareerInsights" component={CareerInsights} options={{ title: 'Career Insights' }} />
    <Stack.Screen name="ProfileStrengthMeter" component={ProfileStrengthMeter} options={{ title: 'Profile Strength' }} />
    <Stack.Screen name="Premium" component={PremiumScreen} options={{ title: 'Premium' }} />
    <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
    <Stack.Screen name="SubscriptionStatus" component={SubscriptionStatus} options={{ title: 'Subscription' }} />
  </Stack.Navigator>
);
