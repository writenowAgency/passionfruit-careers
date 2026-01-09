import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { PassionfruitLogo } from './PassionfruitLogo';

interface Props {
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<Props> = ({ title, subtitle }) => (
  <View style={{ alignItems: 'center', padding: 24 }}>
    <PassionfruitLogo size={56} />
    <Text variant="titleMedium" style={{ marginTop: 16 }}>
      {title}
    </Text>
    {subtitle ? (
      <Text variant="bodyMedium" style={{ marginTop: 8, textAlign: 'center' }}>
        {subtitle}
      </Text>
    ) : null}
  </View>
);
