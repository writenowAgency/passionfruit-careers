import React, { useState } from 'react';
import { ScrollView, View, Alert, StyleSheet } from 'react-native';
import { Card, Text, TextInput, Button, Switch, IconButton } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/profileSlice';
import { profileApi } from '@/services/profileApi';
import { ProfileData } from '@/services/profileApi';

interface ExperienceFormProps {
  profile: ProfileData;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ profile }) => {
  const dispatch = useAppDispatch();
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
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Work Experience ({profile.experience.length})
          </Text>

          {profile.experience.length > 0 && (
            <View style={styles.experienceList}>
              {profile.experience.map((exp) => (
                <View key={exp.id} style={styles.experienceItem}>
                  <View style={styles.experienceInfo}>
                    <Text variant="titleMedium">{exp.jobTitle}</Text>
                    <Text variant="bodyMedium">{exp.companyName}</Text>
                    {exp.location && <Text variant="bodySmall" style={styles.location}>{exp.location}</Text>}
                    <Text variant="bodySmall" style={styles.dates}>
                      {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrent ? 'Present' : new Date(exp.endDate!).toLocaleDateString()}
                    </Text>
                    {exp.description && (
                      <Text variant="bodySmall" style={styles.description}>{exp.description}</Text>
                    )}
                  </View>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDelete(exp.id)}
                    disabled={loading}
                  />
                </View>
              ))}
            </View>
          )}

          {!showForm && (
            <Button mode="outlined" onPress={() => setShowForm(true)} style={styles.addButton}>
              {profile.experience.length === 0 ? 'Add Your First Experience' : 'Add Experience'}
            </Button>
          )}
        </Card.Content>
      </Card>

      {showForm && (
        <Card style={styles.card}>
          <Card.Content style={styles.form}>
            <Text variant="titleMedium" style={styles.formTitle}>New Work Experience</Text>

            <TextInput
              label="Job Title *"
              value={jobTitle}
              onChangeText={setJobTitle}
              mode="outlined"
              placeholder="e.g., Senior Developer"
              style={styles.input}
            />

            <TextInput
              label="Company Name *"
              value={companyName}
              onChangeText={setCompanyName}
              mode="outlined"
              placeholder="e.g., Tech Corp"
              style={styles.input}
            />

            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              placeholder="e.g., Johannesburg, South Africa"
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Describe your responsibilities and achievements..."
              style={styles.input}
            />

            <TextInput
              label="Start Date * (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
              mode="outlined"
              placeholder="2023-01-15"
              style={styles.input}
            />

            <View style={styles.currentSwitch}>
              <Text>I currently work here</Text>
              <Switch value={isCurrent} onValueChange={setIsCurrent} />
            </View>

            {!isCurrent && (
              <TextInput
                label="End Date (YYYY-MM-DD)"
                value={endDate}
                onChangeText={setEndDate}
                mode="outlined"
                placeholder="2024-12-31"
                style={styles.input}
              />
            )}

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => {
                  resetForm();
                  setShowForm(false);
                }}
                style={styles.button}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAdd}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Add Experience
              </Button>
            </View>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  experienceList: {
    marginBottom: 16,
  },
  experienceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  experienceInfo: {
    flex: 1,
  },
  location: {
    color: '#666',
    marginTop: 4,
  },
  dates: {
    color: '#999',
    marginTop: 4,
  },
  description: {
    color: '#666',
    marginTop: 8,
  },
  addButton: {
    marginTop: 8,
  },
  form: {
    gap: 12,
  },
  formTitle: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  currentSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
});

export default ExperienceForm;
