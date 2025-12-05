import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/profileSlice';
import PersonalInfoForm from './PersonalInfoForm';
import PhotoUpload from './PhotoUpload';
import SkillsForm from './SkillsForm';

const EditProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const dispatch = useAppDispatch();
  const { data: profile, loading } = useAppSelector((state) => state.profile);

  const handlePhotoUploaded = (photoUrl: string) => {
    // Refresh profile to get updated data
    dispatch(fetchProfile());
  };

  const handlePhotoDeleted = () => {
    dispatch(fetchProfile());
  };

  if (loading || !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          { value: 'personal', label: 'Personal' },
          { value: 'skills', label: 'Skills' },
          { value: 'experience', label: 'Experience' },
          { value: 'education', label: 'Education' },
        ]}
        style={styles.tabs}
      />

      <ScrollView style={styles.content}>
        {activeTab === 'personal' && (
          <>
            <PhotoUpload
              currentPhotoUrl={profile.profile.profilePhotoUrl}
              onPhotoUploaded={handlePhotoUploaded}
              onPhotoDeleted={handlePhotoDeleted}
            />
            <PersonalInfoForm profile={profile} />
          </>
        )}
        {activeTab === 'skills' && <SkillsForm profile={profile} />}
        {activeTab === 'experience' && (
          <View style={styles.placeholder}>
            <Text>Experience management - Backend APIs ready, form coming soon...</Text>
          </View>
        )}
        {activeTab === 'education' && (
          <View style={styles.placeholder}>
            <Text>Education management - Backend APIs ready, form coming soon...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    margin: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  placeholder: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
});

export default EditProfileScreen;
