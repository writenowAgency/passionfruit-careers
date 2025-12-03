import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { PrimaryButton } from '@/components/common/PrimaryButton';

const CreditsScreen: React.FC = () => (
  <View style={{ flex: 1, padding: 24, gap: 16 }}>
    <Card>
      <Card.Content>
        <Text variant="headlineMedium">Credits balance</Text>
        <Text variant="displaySmall">128</Text>
        <PrimaryButton onPress={() => {}} style={{ marginTop: 12 }}>
          Buy credits
        </PrimaryButton>
      </Card.Content>
    </Card>
  </View>
);

export default CreditsScreen;
