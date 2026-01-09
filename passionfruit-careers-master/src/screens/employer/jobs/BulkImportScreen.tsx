import React from 'react';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { Text } from 'react-native-paper';

const BulkImportScreen: React.FC = () => (
  <ScreenContainer title="Bulk import">
    <Text>Upload CSV positions.</Text>
  </ScreenContainer>
);

export default BulkImportScreen;
