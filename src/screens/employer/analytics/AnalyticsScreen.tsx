import React from 'react';
import { ScrollView } from 'react-native';
import { Card, Text } from 'react-native-paper';

const EmployerAnalyticsScreen: React.FC = () => (
  <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
    <Card>
      <Card.Title title="Conversion funnel" subtitle="View ? Apply ? Interview" />
      <Card.Content>
        <Text>Views: 1 204</Text>
        <Text>Applies: 248</Text>
        <Text>Interviews: 36</Text>
      </Card.Content>
    </Card>
    <Card>
      <Card.Title title="Top performers" />
      <Card.Content>
        <Text>Product Designer — 92% match avg</Text>
      </Card.Content>
    </Card>
  </ScrollView>
);

export default EmployerAnalyticsScreen;
