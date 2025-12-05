import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch } from '@/store/hooks';
import { updatePersonalInfo } from '@/store/slices/profileSlice';
import { ProfileData, PersonalInfoUpdate } from '@/services/profileApi';
import { useNavigation } from '@react-navigation/native';

interface PersonalInfoFormProps {
  profile: ProfileData;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ profile }) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoUpdate>({
    defaultValues: {
      headline: profile.profile.headline || '',
      bio: profile.profile.bio || '',
      location: profile.profile.location || '',
      phone: profile.profile.phone || '',
      linkedinUrl: profile.profile.linkedinUrl || '',
      portfolioUrl: profile.profile.portfolioUrl || '',
      yearsOfExperience: profile.profile.yearsOfExperience || 0,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMessage('');
      setIsSubmitting(true);

      // Remove empty strings and convert to null
      const cleanedData: PersonalInfoUpdate = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          cleanedData[key as keyof PersonalInfoUpdate] = value;
        }
      });

      await dispatch(updatePersonalInfo(cleanedData)).unwrap();

      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.toString() : 'Failed to update profile';
      setErrorMessage(errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            Personal Information
          </Text>

          {errorMessage ? (
            <Card style={styles.errorCard}>
              <Card.Content>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </Card.Content>
            </Card>
          ) : null}

          <Controller
            control={control}
            name="headline"
            rules={{
              maxLength: {
                value: 100,
                message: 'Headline must be less than 100 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Professional Headline"
                mode="outlined"
                placeholder="e.g., Senior Software Engineer"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={!!errors.headline}
                style={styles.input}
              />
            )}
          />
          {errors.headline && (
            <Text style={styles.errorText}>{errors.headline.message}</Text>
          )}

          <Controller
            control={control}
            name="bio"
            rules={{
              maxLength: {
                value: 500,
                message: 'Bio must be less than 500 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="About Me / Bio"
                mode="outlined"
                placeholder="Tell us about yourself..."
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                error={!!errors.bio}
                style={styles.input}
              />
            )}
          />
          {errors.bio && (
            <Text style={styles.errorText}>{errors.bio.message}</Text>
          )}

          <Controller
            control={control}
            name="location"
            rules={{
              maxLength: {
                value: 100,
                message: 'Location must be less than 100 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Location"
                mode="outlined"
                placeholder="e.g., Cape Town, Western Cape"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={!!errors.location}
                style={styles.input}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            rules={{
              pattern: {
                value: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                message: 'Please enter a valid phone number',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Phone Number"
                mode="outlined"
                placeholder="+27 XX XXX XXXX"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={!!errors.phone}
                style={styles.input}
              />
            )}
          />
          {errors.phone && (
            <Text style={styles.errorText}>{errors.phone.message}</Text>
          )}

          <Controller
            control={control}
            name="linkedinUrl"
            rules={{
              pattern: {
                value: /^https?:\/\/(www\.)?linkedin\.com\/.+/,
                message: 'Please enter a valid LinkedIn URL',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="LinkedIn URL"
                mode="outlined"
                placeholder="https://linkedin.com/in/yourprofile"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="url"
                error={!!errors.linkedinUrl}
                style={styles.input}
              />
            )}
          />
          {errors.linkedinUrl && (
            <Text style={styles.errorText}>{errors.linkedinUrl.message}</Text>
          )}

          <Controller
            control={control}
            name="portfolioUrl"
            rules={{
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'Please enter a valid URL',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Portfolio URL"
                mode="outlined"
                placeholder="https://yourportfolio.com"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="url"
                error={!!errors.portfolioUrl}
                style={styles.input}
              />
            )}
          />
          {errors.portfolioUrl && (
            <Text style={styles.errorText}>{errors.portfolioUrl.message}</Text>
          )}

          <Controller
            control={control}
            name="yearsOfExperience"
            rules={{
              min: {
                value: 0,
                message: 'Years of experience must be 0 or greater',
              },
              max: {
                value: 50,
                message: 'Years of experience must be less than 50',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Years of Experience"
                mode="outlined"
                placeholder="0"
                value={value?.toString() || ''}
                onBlur={onBlur}
                onChangeText={(text) => onChange(parseInt(text) || 0)}
                keyboardType="number-pad"
                error={!!errors.yearsOfExperience}
                style={styles.input}
              />
            )}
          />
          {errors.yearsOfExperience && (
            <Text style={styles.errorText}>
              {errors.yearsOfExperience.message}
            </Text>
          )}

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={onSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.button}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </View>
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
  input: {
    marginBottom: 12,
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
  errorCard: {
    backgroundColor: '#ffebee',
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 12,
    marginBottom: 8,
  },
});

export default PersonalInfoForm;
