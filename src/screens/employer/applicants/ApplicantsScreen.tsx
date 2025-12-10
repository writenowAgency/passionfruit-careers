import React from 'react';
import { SafeAreaView, View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { ApplicantCard } from '@/components/cards/ApplicantCard';
import { employerApi, RecentApplicant } from '@/services/employerApi';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing } from '@/theme';

const EmployerApplicantsScreen: React.FC = () => {
  const token = useAppSelector((state) => state.auth.token);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [applicants, setApplicants] = React.useState<RecentApplicant[]>([]);

  React.useEffect(() => {
    fetchApplicants();
  }, [token]);

  const fetchApplicants = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await employerApi.getRecentApplicants(token, 100);
      setApplicants(data.applicants);
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchApplicants();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      {applicants.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
            No applicants yet
          </Text>
        </View>
      ) : (
        <FlashList
          data={applicants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <ApplicantCard applicant={item} />}
          refreshing={refreshing}
          onRefresh={onRefresh}
          estimatedItemSize={220}
        />
      )}
    </SafeAreaView>
  );
};

export default EmployerApplicantsScreen;
