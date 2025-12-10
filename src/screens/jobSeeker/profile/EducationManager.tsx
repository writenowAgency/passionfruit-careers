import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Card, Text, TextInput, IconButton } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/profileSlice';
import { profileApi } from '@/services/profileApi';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';

const EducationManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: profile } = useAppSelector((state) => state.profile);
  const auth = useAppSelector((state) => state.auth);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
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
        endDate: endDate || null,
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
      'Are you sure you want to delete this education entry?',
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
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card>
        <Card.Content>
          <Text variant="headlineSmall" style={{ marginBottom: 16 }}>
            Education
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16, color: 'gray' }}>
            Add your educational qualifications and degrees
          </Text>
          {!showForm && (
            <PrimaryButton onPress={() => setShowForm(true)}>
              Add Education
            </PrimaryButton>
          )}
        </Card.Content>
      </Card>

      {showForm && (
        <Card>
          <Card.Content style={{ gap: 12 }}>
            <Text variant="titleMedium">New Education</Text>
            <TextInput label="Institution Name *" value={institutionName} onChangeText={setInstitutionName} mode="outlined" placeholder="e.g., University of Johannesburg" />
            <TextInput label="Degree *" value={degree} onChangeText={setDegree} mode="outlined" placeholder="e.g., Bachelor of Science" />
            <TextInput label="Field of Study" value={fieldOfStudy} onChangeText={setFieldOfStudy} mode="outlined" placeholder="e.g., Computer Science" />
            <TextInput label="Grade" value={grade} onChangeText={setGrade} mode="outlined" placeholder="e.g., 3.8 GPA or First Class" />
            <TextInput label="Start Date * (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} mode="outlined" placeholder="2014-01-15" />
            <TextInput label="End Date (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} mode="outlined" placeholder="2017-12-31" />
            <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={3} placeholder="Describe your studies, achievements, etc." />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <View style={{ flex: 1 }}><PrimaryButton onPress={handleAdd} loading={loading}>Add Education</PrimaryButton></View>
              <View style={{ flex: 1 }}><SecondaryButton onPress={() => { setShowForm(false); resetForm(); }} disabled={loading}>Cancel</SecondaryButton></View>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card>
        <Card.Content>
          <Text variant="titleMedium" style={{ marginBottom: 16 }}>
            Your Education ({profile?.education.length || 0})
          </Text>
          {profile?.education && profile.education.length > 0 ? (
            profile.education.map((edu) => (
              <Card key={edu.id} style={{ marginBottom: 12 }}>
                <Card.Content>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text variant="titleMedium">{edu.degree}</Text>
                      <Text variant="bodyMedium">{edu.institutionName}</Text>
                      {edu.fieldOfStudy && <Text variant="bodySmall">{edu.fieldOfStudy}</Text>}
                      {edu.grade && <Text variant="bodySmall" style={{ color: 'gray' }}>Grade: {edu.grade}</Text>}
                      <Text variant="bodySmall" style={{ color: 'gray', marginTop: 4 }}>
                        {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                      </Text>
                      {edu.description && <Text variant="bodySmall" style={{ marginTop: 8 }}>{edu.description}</Text>}
                    </View>
                    <IconButton icon="delete" size={20} onPress={() => handleDelete(edu.id)} />
                  </View>
                </Card.Content>
              </Card>
            ))
          ) : (
            <Text style={{ color: 'gray' }}>No education added yet</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default EducationManager;
