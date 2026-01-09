import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

const SubscriptionStatus: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
    <Text variant="headlineLarge">Premium active</Text>
    <Text style={{ marginTop: 8 }}>Renews on 30 Nov 2025</Text>
  </View>
);

export default SubscriptionStatus;
