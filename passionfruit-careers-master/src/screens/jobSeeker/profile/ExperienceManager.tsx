import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { Card, Text, TextInput, Switch, IconButton, Snackbar, Portal, Dialog, Button, Paragraph } from 'react-native-paper';
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

      await profileApi.addExperience(auth.token!, experienceData);

      setSnackbarMessage('Work experience added successfully!');
      setSnackbarVisible(true);
      resetForm();
      setShowForm(false);
      dispatch(fetchProfile());
    } catch (error) {
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
      dispatch(fetchProfile());
    } catch (error) {
      setSnackbarMessage('Failed to delete experience');
      setSnackbarVisible(true);
    } finally {
      setSelectedExperienceId(null);
    }
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
              placeholder="Senior Developer"
            />

            <TextInput
              label="Company Name *"
              value={companyName}
              onChangeText={setCompanyName}
              mode="outlined"
              placeholder="Tech Corp"
            />

            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              placeholder="Johannesburg, South Africa"
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              placeholder="Describe your responsibilities and achievements"
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
  // No custom modal styles needed
});

export default ExperienceManager;
