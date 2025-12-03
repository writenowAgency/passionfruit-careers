import React from 'react';
import { ScrollView, Share } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, Chip, List } from 'react-native-paper';
import { MatchScoreBadge } from '@/components/common/MatchScoreBadge';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';
import { useAppSelector } from '@/store/hooks';
import { JobSeekerJobsStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import * as Linking from 'expo-linking';

const JobDetailsScreen: React.FC = () => {
  const route = useRoute<NativeStackScreenProps<JobSeekerJobsStackParamList, 'JobDetails'>['route']>();
  const jobs = useAppSelector((state) => state.jobs.list);
  const job = jobs.find((j) => j.id === route.params?.jobId) || jobs[0];

  const shareJob = async () => {
    if (!job) return;
    const url = Linking.createURL(`job/${job.id}`);
    await Share.share({ title: job.title, message: `${job.title} at ${job.company} - ${url}` });
  };

  if (!job) {
    return (
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text>No job data available.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
      <Text variant="headlineLarge">{job.title}</Text>
      <Text variant="titleMedium" style={{ color: colors.textSecondary }}>
        {job.company} � {job.location}
      </Text>
      <MatchScoreBadge score={job.matchScore} size="large" />
      <PrimaryButton onPress={() => {}}>Apply now</PrimaryButton>
      <SecondaryButton onPress={shareJob}>Share role</SecondaryButton>

      <List.Section>
        <List.Accordion title="Highlights" left={(props) => <List.Icon {...props} icon="star" />}>
          {job.tags.map((tag) => (
            <Chip key={tag} style={{ marginBottom: 8 }}>
              {tag}
            </Chip>
          ))}
        </List.Accordion>
        <List.Accordion title="Description" left={(props) => <List.Icon {...props} icon="text" />}>
          <Text>{job.description}</Text>
        </List.Accordion>
      </List.Section>
    </ScrollView>
  );
};

export default JobDetailsScreen;
