import React from 'react';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { Text } from 'react-native-paper';

const SavedJobsScreen: React.FC = () => (
  <ScreenContainer title="Saved jobs">
    <Text>Your bookmarked roles.</Text>
  </ScreenContainer>
);

export default SavedJobsScreen;
