import React, { useEffect } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { Card, Text, Chip, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { fetchProfile } from '@/store/slices/profileSlice';
import { ProgressBar } from '@/components/common/ProgressBar';
import { PrimaryButton } from '@/components/common/PrimaryButton';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { data: profile, loading, error } = useAppSelector((state) => state.profile);
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (auth.token && !profile) {
      dispatch(fetchProfile());
    }
  }, [auth.token, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 16 }}>Error: {error}</Text>
        <Button mode="contained" onPress={() => dispatch(fetchProfile())}>
          Retry
        </Button>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text>No profile data available</Text>
        <Button mode="contained" onPress={() => dispatch(fetchProfile())} style={{ marginTop: 16 }}>
          Load Profile
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Card>
        <Card.Content style={{ gap: 12 }}>
          <Text variant="headlineMedium">{profile.user.fullName}</Text>
          {profile.profile.headline && (
            <Text variant="titleMedium">{profile.profile.headline}</Text>
          )}
          {profile.profile.location && (
            <Text variant="bodyMedium">📍 {profile.profile.location}</Text>
          )}
          {profile.profile.phone && (
            <Text variant="bodyMedium">📞 {profile.profile.phone}</Text>
          )}
          <PrimaryButton onPress={() => navigation.navigate('EditProfile' as never)}>
            Edit Profile
          </PrimaryButton>
        </Card.Content>
      </Card>

      <Card>
        <Card.Content>
          <Text variant="titleLarge">Profile strength</Text>
          <ProgressBar
            progress={profile.profile.completion / 100}
            label={`${profile.profile.completion}% complete`}
          />
          <PrimaryButton onPress={() => navigation.navigate('ProfileStrengthMeter' as never)}>
            Improve profile
          </PrimaryButton>
        </Card.Content>
      </Card>

      {profile.profile.bio && (
        <Card>
          <Card.Title title="About" />
          <Card.Content>
            <Text>{profile.profile.bio}</Text>
          </Card.Content>
        </Card>
      )}

      <Card>
        <Card.Title
          title="Skills"
          subtitle={`${profile.skills.length} skills`}
          right={() => (
            <PrimaryButton onPress={() => navigation.navigate('SkillsManager' as never)} compact>
              Manage
            </PrimaryButton>
          )}
        />
        <Card.Content style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {profile.skills.length > 0 ? (
            profile.skills.map((skill) => (
              <Chip key={skill.id}>{skill.name}</Chip>
            ))
          ) : (
            <Text>No skills added yet</Text>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Title
          title="Experience"
          subtitle={`${profile.experience.length} positions`}
          right={() => (
            <PrimaryButton onPress={() => navigation.navigate('ExperienceManager' as never)} compact>
              Manage
            </PrimaryButton>
          )}
        />
        <Card.Content>
          {profile.experience.length > 0 ? (
            profile.experience.slice(0, 3).map((exp) => (
              <View key={exp.id} style={{ marginBottom: 12 }}>
                <Text variant="titleMedium">{exp.jobTitle}</Text>
                <Text variant="bodyMedium">{exp.companyName}</Text>
                <Text variant="bodySmall" style={{ color: 'gray' }}>
                  {new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : new Date(exp.endDate!).getFullYear()}
                </Text>
              </View>
            ))
          ) : (
            <Text>No experience added yet</Text>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Title
          title="Education"
          subtitle={`${profile.education.length} qualifications`}
          right={() => (
            <PrimaryButton onPress={() => navigation.navigate('EducationManager' as never)} compact>
              Manage
            </PrimaryButton>
          )}
        />
        <Card.Content>
          {profile.education.length > 0 ? (
            profile.education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 12 }}>
                <Text variant="titleMedium">{edu.degree}</Text>
                <Text variant="bodyMedium">{edu.institutionName}</Text>
                {edu.fieldOfStudy && (
                  <Text variant="bodySmall">{edu.fieldOfStudy}</Text>
                )}
              </View>
            ))
          ) : (
            <Text>No education added yet</Text>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Title
          title="Certifications"
          subtitle={`${profile.certifications?.length || 0} certifications`}
          right={() => (
            <PrimaryButton onPress={() => navigation.navigate('CertificationsManager' as never)} compact>
              Manage
            </PrimaryButton>
          )}
        />
        <Card.Content>
          {profile.certifications && profile.certifications.length > 0 ? (
            profile.certifications.map((cert) => (
              <View key={cert.id} style={{ marginBottom: 12 }}>
                <Text variant="titleMedium">{cert.certificationName}</Text>
                <Text variant="bodyMedium">{cert.issuingOrganization}</Text>
                <Text variant="bodySmall" style={{ color: 'gray' }}>
                  Issued: {new Date(cert.issueDate).getFullYear()}
                  {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).getFullYear()}`}
                </Text>
              </View>
            ))
          ) : (
            <Text>No certifications added yet</Text>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Title
          title="Languages"
          subtitle={`${profile.languages?.length || 0} languages`}
          right={() => (
            <PrimaryButton onPress={() => navigation.navigate('LanguagesManager' as never)} compact>
              Manage
            </PrimaryButton>
          )}
        />
        <Card.Content style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {profile.languages && profile.languages.length > 0 ? (
            profile.languages.map((lang) => (
              <Chip key={lang.id}>
                {lang.languageName} ({lang.proficiencyLevel})
              </Chip>
            ))
          ) : (
            <Text>No languages added yet</Text>
          )}
        </Card.Content>
      </Card>

      {profile.profile.careerObjectives && (
        <Card>
          <Card.Title
            title="Career Objectives"
            right={() => (
              <PrimaryButton onPress={() => navigation.navigate('CareerObjectivesEditor' as never)} compact>
                Edit
              </PrimaryButton>
            )}
          />
          <Card.Content>
            <Text>{profile.profile.careerObjectives}</Text>
          </Card.Content>
        </Card>
      )}

      {!profile.profile.careerObjectives && (
        <Card>
          <Card.Title title="Career Objectives" />
          <Card.Content>
            <Text style={{ marginBottom: 12 }}>Add your career goals and objectives</Text>
            <PrimaryButton onPress={() => navigation.navigate('CareerObjectivesEditor' as never)}>
              Add Career Objectives
            </PrimaryButton>
          </Card.Content>
        </Card>
      )}

      <Card>
        <Card.Title
          title="Documents"
          subtitle={`${profile.documents?.length || 0} documents`}
          right={() => (
            <PrimaryButton onPress={() => navigation.navigate('DocumentsManager' as never)} compact>
              Manage
            </PrimaryButton>
          )}
        />
        <Card.Content>
          {profile.documents && profile.documents.length > 0 ? (
            <View style={{ gap: 8 }}>
              {profile.documents.slice(0, 3).map((doc) => (
                <View key={doc.id}>
                  <Text variant="bodyMedium">{doc.documentName}</Text>
                  <Text variant="bodySmall" style={{ color: 'gray' }}>
                    {doc.documentType.replace('_', ' ')} • {new Date(doc.uploadedAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
              {profile.documents.length > 3 && (
                <Text variant="bodySmall" style={{ color: 'gray', marginTop: 8 }}>
                  +{profile.documents.length - 3} more documents
                </Text>
              )}
            </View>
          ) : (
            <Text>No documents uploaded yet</Text>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Title
          title="Job Preferences"
          subtitle={`${profile.preferredJobCategories?.length || 0} categories • ${profile.profile.preferredWorkType || 'Not set'}`}
          right={() => (
            <PrimaryButton onPress={() => navigation.navigate('PreferencesManager' as never)} compact>
              Manage
            </PrimaryButton>
          )}
        />
        <Card.Content>
          {profile.preferredJobCategories && profile.preferredJobCategories.length > 0 ? (
            <View>
              <Text variant="labelMedium" style={{ marginBottom: 8 }}>Interested In:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                {profile.preferredJobCategories.slice(0, 3).map((cat) => (
                  <Chip key={cat.id}>{cat.categoryName}</Chip>
                ))}
                {profile.preferredJobCategories.length > 3 && (
                  <Text variant="bodySmall" style={{ color: 'gray', alignSelf: 'center' }}>
                    +{profile.preferredJobCategories.length - 3} more
                  </Text>
                )}
              </View>
              {profile.profile.desiredSalaryMin && profile.profile.desiredSalaryMax && (
                <Text variant="bodyMedium">
                  Salary: {profile.profile.salaryCurrency} {profile.profile.desiredSalaryMin.toLocaleString()} - {profile.profile.desiredSalaryMax.toLocaleString()}
                </Text>
              )}
              {profile.profile.availabilityStartDate && (
                <Text variant="bodyMedium" style={{ marginTop: 4 }}>
                  Available: {new Date(profile.profile.availabilityStartDate).toLocaleDateString()}
                </Text>
              )}
            </View>
          ) : (
            <Text>No preferences set yet</Text>
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Content style={{ gap: 8 }}>
          <Text variant="titleLarge">Account</Text>
          <Button mode="contained" onPress={handleLogout} buttonColor="#d32f2f">
            Log out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

export default ProfileScreen;
