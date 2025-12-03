import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppSelector } from '@/store/hooks';
import { MatchScoreBadge } from '@/components/common/MatchScoreBadge';
import { ProgressBar } from '@/components/common/ProgressBar';

const ProfileStrengthMeter: React.FC = () => {
  const completion = useAppSelector((state) => state.profile.completion);

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 16 }}>
      <Text variant="headlineMedium">Profile score</Text>
      <MatchScoreBadge score={completion} size="large" />
      <ProgressBar progress={completion / 100} />
      <Text>Complete more AI prompts to boost your discoverability.</Text>
    </View>
  );
};

export default ProfileStrengthMeter;
