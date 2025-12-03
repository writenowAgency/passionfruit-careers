import React from 'react';
import { SafeAreaView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { ApplicantCard } from '@/components/cards/ApplicantCard';
import { mockApplicants } from '@/data/mockApplicants';

const EmployerApplicantsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <FlashList
        data={mockApplicants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ApplicantCard applicant={item} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        estimatedItemSize={220}
      />
    </SafeAreaView>
  );
};

export default EmployerApplicantsScreen;
