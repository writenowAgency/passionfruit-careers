import React from 'react';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { Text } from 'react-native-paper';

const PersonalInfoStep: React.FC = () => (
  <ScreenContainer title="Personal info">
    <Text>Capture your basics.</Text>
  </ScreenContainer>
);

export default PersonalInfoStep;
