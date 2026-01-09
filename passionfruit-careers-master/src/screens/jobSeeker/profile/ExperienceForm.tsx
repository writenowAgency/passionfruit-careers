import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Card, Text, TextInput, Button, Switch, IconButton, Snackbar, Portal, Dialog, Paragraph } from 'react-native-paper';
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
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Dialog state
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState<number | null>(null);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [location, setLocation] = useState('');

  console.log('[ExperienceForm] Form state:', {
    companyName,
    jobTitle,
    startDate,
    endDate,
    isCurrent,
    location,
  });

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
    console.log('[ExperienceForm] Add button clicked');

    if (!companyName.trim() || !jobTitle.trim() || !startDate.trim()) {
      console.log('[ExperienceForm] Validation failed - missing required fields');
      setSnackbarMessage('Please fill in company name, job title, and start date');
      setSnackbarVisible(true);
      return;
    }

    setLoading(true);
    try {
      const experienceData: any = {
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        description: description.trim() || undefined,
        startDate,
        isCurrent,
        location: location.trim() || undefined,
      };

      // Only include endDate if not currently working here
      if (!isCurrent && endDate) {
        experienceData.endDate = endDate;
      }

      console.log('[ExperienceForm] Submitting experience data:', experienceData);

      await profileApi.addExperience(auth.token!, experienceData);

      console.log('[ExperienceForm] Experience added successfully');

      setSnackbarMessage('Work experience added successfully!');
      setSnackbarVisible(true);

      resetForm();
      setShowForm(false);
      await dispatch(fetchProfile()).unwrap();
    } catch (error) {
      console.error('[ExperienceForm] Add error:', error);
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to add experience');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (experienceId: number) => {
    setSelectedExperienceId(experienceId);
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExperienceId) return;
    
    setDeleteDialogVisible(false);
    try {
      await profileApi.removeExperience(auth.token!, selectedExperienceId);
      setSnackbarMessage('Work experience deleted successfully');
      setSnackbarVisible(true);
      await dispatch(fetchProfile()).unwrap();
    } catch (error) {
      console.error('[ExperienceForm] Delete error:', error);
      setSnackbarMessage('Failed to delete experience');
      setSnackbarVisible(true);
    } finally {
      setSelectedExperienceId(null);
    }
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
              placeholder="Senior Developer"
              style={styles.input}
            />

            <TextInput
              label="Company Name *"
              value={companyName}
              onChangeText={setCompanyName}
              mode="outlined"
              placeholder="Tech Corp"
              style={styles.input}
            />

            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              placeholder="Johannesburg, South Africa"
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Describe your responsibilities and achievements"
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
                onPress={() => {
                  console.log('[ExperienceForm] Button clicked directly!');
                  handleAdd();
                }}
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

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Experience</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete this work experience?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteConfirm} textColor="#d32f2f">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    marginBottom: 12,
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
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
  },
});

export default ExperienceForm;
