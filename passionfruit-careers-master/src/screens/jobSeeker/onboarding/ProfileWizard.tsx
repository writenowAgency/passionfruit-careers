import React from 'react';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { Text } from 'react-native-paper';

const ProfileWizard: React.FC = () => (
  <ScreenContainer title="Profile wizard">
    <Text>Multi-step onboarding for job seekers.</Text>
  </ScreenContainer>
);

export default ProfileWizard;
