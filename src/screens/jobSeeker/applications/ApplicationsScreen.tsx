import React from 'react';
import { SafeAreaView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Card, Text, ProgressBar } from 'react-native-paper';
import { PrimaryButton } from '@/components/common/PrimaryButton';

const sampleApplications = [
  {
    id: 'app-1',
    title: 'Senior React Native Engineer',
    company: 'CapeTech Labs',
    status: 'Interview',
    progress: 0.66,
  },
  {
    id: 'app-2',
    title: 'AI Product Manager',
    company: 'Passionfruit Careers',
    status: 'Submitted',
    progress: 0.33,
  },
];

const ApplicationsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <FlashList
        data={sampleApplications}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        estimatedItemSize={180}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 16 }}>
            <Card.Content>
              <Text variant="titleMedium">{item.title}</Text>
              <Text variant="bodySmall" style={{ color: '#757575' }}>
                {item.company}
              </Text>
              <Text style={{ marginVertical: 8 }}>Status: {item.status}</Text>
              <ProgressBar progress={item.progress} />
              <PrimaryButton onPress={() => {}} style={{ marginTop: 12 }}>
                View timeline
              </PrimaryButton>
            </Card.Content>
          </Card>
        )}
      />
    </SafeAreaView>
  );
};

export default ApplicationsScreen;
