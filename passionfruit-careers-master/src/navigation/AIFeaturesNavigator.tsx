import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AIAutoApplyScreen from '@/screens/jobSeeker/aiFeatures/AIAutoApplyScreen';
import AutoApplySettings from '@/screens/jobSeeker/aiFeatures/AutoApplySettings';
import DailySummaryScreen from '@/screens/jobSeeker/aiFeatures/DailySummaryScreen';
import CoverLetterGenerator from '@/screens/jobSeeker/aiFeatures/CoverLetterGenerator';
import ProfileOptimizer from '@/screens/jobSeeker/aiFeatures/ProfileOptimizer';
import { AIFeaturesStackParamList } from './types';

const Stack = createNativeStackNavigator<AIFeaturesStackParamList>();

export const AIFeaturesNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="AIAutoApply" component={AIAutoApplyScreen} options={{ title: 'AI Auto-Apply' }} />
    <Stack.Screen name="AutoApplySettings" component={AutoApplySettings} options={{ title: 'Settings' }} />
    <Stack.Screen name="DailySummary" component={DailySummaryScreen} options={{ title: 'Daily summary' }} />
    <Stack.Screen name="CoverLetter" component={CoverLetterGenerator} options={{ title: 'Cover letters' }} />
    <Stack.Screen name="ProfileOptimizer" component={ProfileOptimizer} options={{ title: 'Optimizer' }} />
  </Stack.Navigator>
);
