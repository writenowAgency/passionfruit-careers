import React from 'react';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { Text } from 'react-native-paper';

const DailySummaryScreen: React.FC = () => (
  <ScreenContainer title="Daily summary">
    <Text>Recap of AI actions.</Text>
  </ScreenContainer>
);

export default DailySummaryScreen;
