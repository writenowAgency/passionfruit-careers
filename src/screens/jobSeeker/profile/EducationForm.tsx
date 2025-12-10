import React, { useState } from 'react';
import { ScrollView, View, Alert, StyleSheet } from 'react-native';
import { Card, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/profileSlice';
import { profileApi } from '@/services/profileApi';
import { ProfileData } from '@/services/profileApi';

interface EducationFormProps {
  profile: ProfileData;
}

const EducationForm: React.FC<EducationFormProps> = ({ profile }) => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [institutionName, setInstitutionName] = useState('');
  const [degree, setDegree] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setInstitutionName('');
    setDegree('');
    setFieldOfStudy('');
    setStartDate('');
    setEndDate('');
    setGrade('');
    setDescription('');
  };

  const handleAdd = async () => {
    if (!institutionName.trim() || !degree.trim() || !startDate.trim()) {
      Alert.alert('Error', 'Please fill in institution name, degree, and start date');
      return;
    }

    setLoading(true);
    try {
      await profileApi.addEducation(auth.token!, {
        institutionName: institutionName.trim(),
        degree: degree.trim(),
        fieldOfStudy: fieldOfStudy.trim() || undefined,
        startDate,
        endDate: endDate || undefined,
        grade: grade.trim() || undefined,
        description: description.trim() || undefined,
      });

      Alert.alert('Success', 'Education added successfully');
      resetForm();
      setShowForm(false);
      dispatch(fetchProfile());
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add education');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (educationId: number) => {
    Alert.alert(
      'Delete Education',
      'Are you sure you want to delete this education?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await profileApi.removeEducation(auth.token!, educationId);
              Alert.alert('Success', 'Education deleted');
              dispatch(fetchProfile());
            } catch (error) {
              Alert.alert('Error', 'Failed to delete education');
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
            Education ({profile.education.length})
          </Text>

          {profile.education.length > 0 && (
            <View style={styles.educationList}>
              {profile.education.map((edu) => (
                <View key={edu.id} style={styles.educationItem}>
                  <View style={styles.educationInfo}>
                    <Text variant="titleMedium">{edu.degree}</Text>
                    <Text variant="bodyMedium">{edu.institutionName}</Text>
                    {edu.fieldOfStudy && (
                      <Text variant="bodySmall" style={styles.field}>{edu.fieldOfStudy}</Text>
                    )}
                    <Text variant="bodySmall" style={styles.dates}>
                      {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                    </Text>
                    {edu.grade && (
                      <Text variant="bodySmall" style={styles.grade}>Grade: {edu.grade}</Text>
                    )}
                    {edu.description && (
                      <Text variant="bodySmall" style={styles.description}>{edu.description}</Text>
                    )}
                  </View>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleDelete(edu.id)}
                    disabled={loading}
                  />
                </View>
              ))}
            </View>
          )}

          {!showForm && (
            <Button mode="outlined" onPress={() => setShowForm(true)} style={styles.addButton}>
              {profile.education.length === 0 ? 'Add Your First Education' : 'Add Education'}
            </Button>
          )}
        </Card.Content>
      </Card>

      {showForm && (
        <Card style={styles.card}>
          <Card.Content style={styles.form}>
            <Text variant="titleMedium" style={styles.formTitle}>New Education</Text>

            <TextInput
              label="Institution Name *"
              value={institutionName}
              onChangeText={setInstitutionName}
              mode="outlined"
              placeholder="e.g., University of Cape Town"
              style={styles.input}
            />

            <TextInput
              label="Degree *"
              value={degree}
              onChangeText={setDegree}
              mode="outlined"
              placeholder="e.g., Bachelor of Science"
              style={styles.input}
            />

            <TextInput
              label="Field of Study"
              value={fieldOfStudy}
              onChangeText={setFieldOfStudy}
              mode="outlined"
              placeholder="e.g., Computer Science"
              style={styles.input}
            />

            <TextInput
              label="Start Date * (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
              mode="outlined"
              placeholder="2019-01-15"
              style={styles.input}
            />

            <TextInput
              label="End Date (YYYY-MM-DD)"
              value={endDate}
              onChangeText={setEndDate}
              mode="outlined"
              placeholder="2023-12-31 (leave empty if ongoing)"
              style={styles.input}
            />

            <TextInput
              label="Grade/GPA"
              value={grade}
              onChangeText={setGrade}
              mode="outlined"
              placeholder="e.g., 3.8/4.0 or First Class"
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Additional details about your studies..."
              style={styles.input}
            />

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
                Add Education
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
  educationList: {
    marginBottom: 16,
  },
  educationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  educationInfo: {
    flex: 1,
  },
  field: {
    color: '#666',
    marginTop: 4,
  },
  dates: {
    color: '#999',
    marginTop: 4,
  },
  grade: {
    color: '#666',
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
});

export default EducationForm;
