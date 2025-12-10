import React from 'react';
import { View } from 'react-native';
import { useAppSelector } from '@/store/hooks';
import SkillsForm from './SkillsForm';
import { ActivityIndicator, Text } from 'react-native-paper';

const SkillsManager: React.FC = () => {
  const { data: profile, loading } = useAppSelector((state) => state.profile);

  if (loading || !profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  return <SkillsForm profile={profile} />;
};

export default SkillsManager;
