import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Card, Text, TextInput, Button, Switch, IconButton } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/profileSlice';
import { profileApi } from '@/services/profileApi';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';

const ExperienceManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: profile } = useAppSelector((state) => state.profile);
  const auth = useAppSelector((state) => state.auth);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [location, setLocation] = useState('');

  const resetForm = () => {
    setCompanyName('');
    setJobTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
    setLocation('');
  };

  const handleAdd = async () => {
    if (!companyName.trim() || !jobTitle.trim() || !startDate.trim()) {
      Alert.alert('Error', 'Please fill in company name, job title, and start date');
      return;
    }

    setLoading(true);
    try {
      await profileApi.addExperience(auth.token!, {
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate: isCurrent ? null : (endDate || null),
        isCurrent,
        location: location.trim() || undefined,
      });

      Alert.alert('Success', 'Work experience added successfully');
      resetForm();
      setShowForm(false);
      dispatch(fetchProfile());
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add experience');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (experienceId: number) => {
    Alert.alert(
      'Delete Experience',
      'Are you sure you want to delete this work experience?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await profileApi.removeExperience(auth.token!, experienceId);
              Alert.alert('Success', 'Work experience deleted');
              dispatch(fetchProfile());
            } catch (error) {
              Alert.alert('Error', 'Failed to delete experience');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card>
        <Card.Content>
          <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
            Work Experience
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16, color: 'gray' }}>
            Add your work history to showcase your professional background
          </Text>

          {!showForm && (
            <PrimaryButton onPress={() => setShowForm(true)}>
              Add Work Experience
            </PrimaryButton>
          )}
        </Card.Content>
      </Card>

      {showForm && (
        <Card>
          <Card.Content style={{ gap: 12 }}>
            <Text variant="titleMedium">New Work Experience</Text>

            <TextInput
              label="Job Title *"
              value={jobTitle}
              onChangeText={setJobTitle}
              mode="outlined"
              placeholder="e.g., Senior Developer"
            />

            <TextInput
              label="Company Name *"
              value={companyName}
              onChangeText={setCompanyName}
              mode="outlined"
              placeholder="e.g., Tech Corp"
            />

            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              placeholder="e.g., Johannesburg, South Africa"
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Describe your responsibilities and achievements..."
            />

            <TextInput
              label="Start Date * (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
              mode="outlined"
              placeholder="2020-01-15"
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Switch value={isCurrent} onValueChange={setIsCurrent} />
              <Text>I currently work here</Text>
            </View>

            {!isCurrent && (
              <TextInput
                label="End Date (YYYY-MM-DD)"
                value={endDate}
                onChangeText={setEndDate}
                mode="outlined"
                placeholder="2023-12-31"
              />
            )}

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <PrimaryButton onPress={handleAdd} loading={loading}>
                  Add Experience
                </PrimaryButton>
              </View>
              <View style={{ flex: 1 }}>
                <SecondaryButton
                  onPress={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Cancel
                </SecondaryButton>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>
            Your Experience ({profile?.experience.length || 0})
          </Text>

          {profile?.experience && profile.experience.length > 0 ? (
            profile.experience.map((exp) => (
              <Card key={exp.id} style={{ marginBottom: 12 }}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium">{exp.jobTitle}</Text>
                      <Text variant="bodyMedium">{exp.companyName}</Text>
                      {exp.location && (
                        <Text variant="bodySmall" style={{ color: 'gray' }}>
                          📍 {exp.location}
                        </Text>
                      )}
                      <Text variant="bodySmall" style={{ color: 'gray', marginTop: 4 }}>
                        {new Date(exp.startDate).toLocaleDateString()} -{' '}
                        {exp.isCurrent ? 'Present' : new Date(exp.endDate!).toLocaleDateString()}
                      </Text>
                      {exp.description && (
                        <Text variant="bodySmall" style={{ marginTop: 8 }}>
                          {exp.description}
                        </Text>
                      )}
                    </View>
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDelete(exp.id)}
                    />
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={{ color: 'gray' }}>No work experience added yet</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default ExperienceManager;
