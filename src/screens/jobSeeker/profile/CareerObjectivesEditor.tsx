import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Card, Text, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/profileSlice';
import { profileApi } from '@/services/profileApi';
import { PrimaryButton } from '@/components/common/PrimaryButton';

const CareerObjectivesEditor: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { data: profile } = useAppSelector((state) => state.profile);
  const auth = useAppSelector((state) => state.auth);

  const [careerObjectives, setCareerObjectives] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.profile.careerObjectives) {
      setCareerObjectives(profile.profile.careerObjectives);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!careerObjectives.trim()) {
      Alert.alert('Error', 'Please enter your career objectives');
      return;
    }

    setLoading(true);
    try {
      await profileApi.updateCareerObjectives(auth.token!, {
        careerObjectives: careerObjectives.trim(),
      });

      Alert.alert('Success', 'Career objectives saved successfully');
      dispatch(fetchProfile());
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save career objectives');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card>
        <Card.Content style={{ gap: 12 }}>
          <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
            Career Objectives
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16, color: 'gray' }}>
            Describe your career goals, what you're looking for in your next role, and what you hope to achieve professionally.
          </Text>

          <TextInput
            label="Career Objectives"
            value={careerObjectives}
            onChangeText={setCareerObjectives}
            mode="outlined"
            multiline
            numberOfLines={8}
            placeholder="e.g., Seeking a challenging role as a Senior Full Stack Developer where I can leverage my expertise in modern web technologies to build scalable applications and mentor junior developers..."
          />

          <Text variant="bodySmall" style={{ color: 'gray', marginTop: 8 }}>
            Tip: Be specific about your goals, desired role, and what you bring to the table. This helps employers understand your motivations.
          </Text>

          <PrimaryButton onPress={handleSave} loading={loading} style={{ marginTop: 8 }}>
            Save Career Objectives
          </PrimaryButton>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default CareerObjectivesEditor;
