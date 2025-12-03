import React from 'react';
import { ScrollView } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PrimaryButton } from '@/components/common/PrimaryButton';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card>
        <Card.Content>
          <Text variant="titleLarge">Profile strength</Text>
          <ProgressBar progress={profile.completion / 100} label={`${profile.completion}% complete`} />
          <PrimaryButton onPress={() => navigation.navigate('ProfileStrengthMeter' as never)}>
            Improve profile
          </PrimaryButton>
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Skills" right={() => (
          <PrimaryButton onPress={() => navigation.navigate('SkillsManager' as never)} compact>
            Manage
          </PrimaryButton>
        )} />
        <Card.Content style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {profile.skills.map((skill) => (
            <Chip key={skill}>{skill}</Chip>
          ))}
        </Card.Content>
      </Card>

      <Card>
        <Card.Title title="Documents" subtitle="CVs and certificates" />
        <Card.Content>
          {profile.documents.map((doc) => (
            <Text key={doc.id}>{doc.name}</Text>
          ))}
          <PrimaryButton onPress={() => navigation.navigate('DocumentsManager' as never)} style={{ marginTop: 8 }}>
            Manage documents
          </PrimaryButton>
        </Card.Content>
      </Card>

      <Card>
        <Card.Content style={{ gap: 8 }}>
          <Text variant="titleLarge">Account</Text>
          <Button mode="contained" onPress={handleLogout} buttonColor="#d32f2f">
            Log out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default ProfileScreen;
