import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Chip, Card, IconButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addSkillAsync, removeSkillAsync } from '@/store/slices/profileSlice';
import { ProfileData } from '@/services/profileApi';

interface SkillsFormProps {
  profile: ProfileData;
}

interface SkillFormData {
  skillName: string;
  proficiencyLevel: string;
  yearsExperience: string;
}

const SkillsForm: React.FC<SkillsFormProps> = ({ profile }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.profile);
  const [isAdding, setIsAdding] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkillFormData>({
    defaultValues: {
      skillName: '',
      proficiencyLevel: '',
      yearsExperience: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await dispatch(addSkillAsync({
        skillName: data.skillName,
        proficiencyLevel: data.proficiencyLevel || undefined,
        yearsExperience: data.yearsExperience ? parseInt(data.yearsExperience) : undefined,
      })).unwrap();

      reset();
      setIsAdding(false);
      Alert.alert('Success', 'Skill added successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add skill');
    }
  });

  const handleRemoveSkill = async (skillId: number, skillName: string) => {
    Alert.alert(
      'Remove Skill',
      `Remove "${skillName}" from your skills?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(removeSkillAsync(skillId)).unwrap();
              Alert.alert('Success', 'Skill removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove skill');
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
            Your Skills ({profile.skills.length})
          </Text>

          {profile.skills.length > 0 ? (
            <View style={styles.skillsContainer}>
              {profile.skills.map((skill) => (
                <View key={skill.id} style={styles.skillItem}>
                  <View style={styles.skillInfo}>
                    <Text variant="titleMedium">{skill.name}</Text>
                    {skill.proficiencyLevel && (
                      <Text variant="bodySmall" style={styles.proficiency}>
                        {skill.proficiencyLevel}
                      </Text>
                    )}
                    {skill.yearsExperience !== null && (
                      <Text variant="bodySmall" style={styles.years}>
                        {skill.yearsExperience} {skill.yearsExperience === 1 ? 'year' : 'years'}
                      </Text>
                    )}
                  </View>
                  <IconButton
                    icon="delete"
                    size={20}
                    onPress={() => handleRemoveSkill(skill.id, skill.name)}
                    disabled={loading}
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No skills added yet</Text>
          )}

          <Button
            mode="outlined"
            onPress={() => setIsAdding(!isAdding)}
            style={styles.addButton}
            disabled={loading}
          >
            {isAdding ? 'Cancel' : 'Add Skill'}
          </Button>

          {isAdding && (
            <View style={styles.form}>
              <Controller
                control={control}
                name="skillName"
                rules={{
                  required: 'Skill name is required',
                  minLength: { value: 2, message: 'Skill name must be at least 2 characters' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Skill Name *"
                    mode="outlined"
                    placeholder="e.g., JavaScript, Project Management"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.skillName}
                    style={styles.input}
                  />
                )}
              />
              {errors.skillName && (
                <Text style={styles.errorText}>{errors.skillName.message}</Text>
              )}

              <Controller
                control={control}
                name="proficiencyLevel"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.proficiencyButtons}>
                    <Text variant="bodyMedium" style={styles.label}>
                      Proficiency Level
                    </Text>
                    <View style={styles.chipContainer}>
                      {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((level) => (
                        <Chip
                          key={level}
                          selected={value === level}
                          onPress={() => onChange(level)}
                          style={styles.chip}
                        >
                          {level}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
              />

              <Controller
                control={control}
                name="yearsExperience"
                rules={{
                  pattern: {
                    value: /^\d+$/,
                    message: 'Must be a valid number',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label="Years of Experience"
                    mode="outlined"
                    placeholder="e.g., 3"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    keyboardType="number-pad"
                    error={!!errors.yearsExperience}
                    style={styles.input}
                  />
                )}
              />
              {errors.yearsExperience && (
                <Text style={styles.errorText}>{errors.yearsExperience.message}</Text>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    reset();
                    setIsAdding(false);
                  }}
                  style={styles.button}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={onSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Add Skill
                </Button>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
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
  skillsContainer: {
    marginBottom: 16,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  skillInfo: {
    flex: 1,
  },
  proficiency: {
    color: '#666',
    marginTop: 4,
  },
  years: {
    color: '#999',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  addButton: {
    marginTop: 8,
  },
  form: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
  },
  proficiencyButtons: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
    marginBottom: 8,
    marginTop: -8,
  },
});

export default SkillsForm;
