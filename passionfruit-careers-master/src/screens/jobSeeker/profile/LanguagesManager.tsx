import React, { useState } from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Card, Text, TextInput, Menu, Button, Chip } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/profileSlice';
import { profileApi } from '@/services/profileApi';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SecondaryButton } from '@/components/common/SecondaryButton';

const PROFICIENCY_LEVELS = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Basic', 'Conversational'];

const LanguagesManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: profile } = useAppSelector((state) => state.profile);
  const auth = useAppSelector((state) => state.auth);

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [languageName, setLanguageName] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  const resetForm = () => {
    setLanguageName('');
    setProficiencyLevel('');
  };

  const handleAdd = async () => {
    if (!languageName.trim() || !proficiencyLevel) {
      Alert.alert('Error', 'Please enter language name and select proficiency level');
      return;
    }

    setLoading(true);
    try {
      await profileApi.addLanguage(auth.token!, {
        languageName: languageName.trim(),
        proficiencyLevel,
      });

      Alert.alert('Success', 'Language added successfully');
      resetForm();
      setShowForm(false);
      dispatch(fetchProfile());
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add language');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (languageId: number) => {
    Alert.alert(
      'Delete Language',
      'Are you sure you want to delete this language?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await profileApi.removeLanguage(auth.token!, languageId);
              Alert.alert('Success', 'Language deleted');
              dispatch(fetchProfile());
            } catch (error) {
              Alert.alert('Error', 'Failed to delete language');
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
          <Text variant="headlineSmall" style={{ marginBottom: 16 }}>Languages</Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16, color: 'gray' }}>
            Add languages you can speak and your proficiency level
          </Text>
          {!showForm && <PrimaryButton onPress={() => setShowForm(true)}>Add Language</PrimaryButton>}
        </Card.Content>
      </Card>

      {showForm && (
        <Card>
          <Card.Content style={{ gap: 12 }}>
            <Text variant="titleMedium">New Language</Text>
            <TextInput
              label="Language Name *"
              value={languageName}
              onChangeText={setLanguageName}
              mode="outlined"
              placeholder="e.g., English"
            />

            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={{ justifyContent: 'flex-start' }}
                >
                  {proficiencyLevel || 'Select Proficiency Level *'}
                </Button>
              }
            >
              {PROFICIENCY_LEVELS.map((level) => (
                <Menu.Item
                  key={level}
                  onPress={() => {
                    setProficiencyLevel(level);
                    setMenuVisible(false);
                  }}
                  title={level}
                />
              ))}
            </Menu>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <PrimaryButton onPress={handleAdd} loading={loading}>
                  Add Language
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
            Your Languages ({profile?.languages?.length || 0})
          </Text>
          {profile?.languages && profile.languages.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {profile.languages.map((lang) => (
                <Chip
                  key={lang.id}
                  onClose={() => handleDelete(lang.id)}
                  style={{ marginBottom: 8 }}
                >
                  {lang.languageName} ({lang.proficiencyLevel})
                </Chip>
              ))}
            </View>
          ) : (
            <Text style={{ color: 'gray' }}>No languages added yet</Text>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default LanguagesManager;
