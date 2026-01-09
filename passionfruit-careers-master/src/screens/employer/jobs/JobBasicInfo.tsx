import React from 'react';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { Text } from 'react-native-paper';

const JobBasicInfo: React.FC = () => (
  <ScreenContainer title="Job basic info">
    <Text>Title, location, type.</Text>
  </ScreenContainer>
);

export default JobBasicInfo;
