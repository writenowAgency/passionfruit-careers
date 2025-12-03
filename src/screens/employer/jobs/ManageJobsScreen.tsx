import React from 'react';
import { SafeAreaView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Card, Text } from 'react-native-paper';
import { mockJobs } from '@/data/mockJobs';

const ManageJobsScreen: React.FC = () => (
  <SafeAreaView style={{ flex: 1, padding: 16 }}>
    <FlashList
      data={mockJobs}
      keyExtractor={(item) => item.id}
      estimatedItemSize={160}
      renderItem={({ item }) => (
        <Card style={{ marginBottom: 12 }}>
          <Card.Content>
            <Text variant="titleMedium">{item.title}</Text>
            <Text>{item.location}</Text>
            <Text style={{ marginTop: 8 }}>{item.matchScore}% avg match</Text>
          </Card.Content>
        </Card>
      )}
    />
  </SafeAreaView>
);

export default ManageJobsScreen;
