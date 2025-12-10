import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useAppDispatch } from '@/store/hooks';
import { updatePersonalInfo } from '@/store/slices/profileSlice';
import { ProfileData, PersonalInfoUpdate } from '@/services/profileApi';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows } from '@/theme';

interface PersonalInfoFormProps {
  profile: ProfileData;
}

/**
 * Modern PersonalInfoForm with improved UI/UX
 *
 * Features:
 * - Grouped fields with clear sections
 * - Better error handling and validation
 * - Modern input styling
 * - Icon indicators
 * - Responsive design
 * - Clear visual hierarchy
 */
const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ profile }) => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
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
      setIsSubmitting(true);

      // Remove empty strings and convert to null
      const cleanedData: PersonalInfoUpdate = {};
      Object.entries(data).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          cleanedData[key as keyof PersonalInfoUpdate] = value;
        }
      });

      await dispatch(updatePersonalInfo(cleanedData)).unwrap();

      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('[PersonalInfoForm] Update error:', error);
      const errorMsg = error instanceof Error ? error.toString() : 'Failed to update profile';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Professional Info Section */}
      <Surface style={styles.section} elevation={0}>
        <View style={styles.sectionHeader}>
          <Ionicons name="briefcase" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Professional Information</Text>
        </View>

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
            <View style={styles.inputGroup}>
              <TextInput
                label="Professional Headline"
                mode="outlined"
                placeholder="e.g., Senior Software Engineer"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={!!errors.headline}
                style={styles.input}
                left={<TextInput.Icon icon="star-outline" />}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
              {errors.headline && (
                <HelperText type="error" visible={!!errors.headline}>
                  {errors.headline.message}
                </HelperText>
              )}
              {!errors.headline && value && (
                <HelperText type="info">
                  {value.length}/100 characters
                </HelperText>
              )}
            </View>
          )}
        />

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
            <View style={styles.inputGroup}>
              <TextInput
                label="About Me / Bio"
                mode="outlined"
                placeholder="Tell us about yourself, your passions, and what makes you unique..."
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                error={!!errors.bio}
                style={[styles.input, styles.textArea]}
                left={<TextInput.Icon icon="text" />}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
              {errors.bio && (
                <HelperText type="error" visible={!!errors.bio}>
                  {errors.bio.message}
                </HelperText>
              )}
              {!errors.bio && value && (
                <HelperText type="info">
                  {value.length}/500 characters
                </HelperText>
              )}
            </View>
          )}
        />

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
            <View style={styles.inputGroup}>
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
                left={<TextInput.Icon icon="calendar-outline" />}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
              {errors.yearsOfExperience && (
                <HelperText type="error" visible={!!errors.yearsOfExperience}>
                  {errors.yearsOfExperience.message}
                </HelperText>
              )}
            </View>
          )}
        />
      </Surface>

      {/* Contact Information Section */}
      <Surface style={styles.section} elevation={0}>
        <View style={styles.sectionHeader}>
          <Ionicons name="call" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Contact Information</Text>
        </View>

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
            <View style={styles.inputGroup}>
              <TextInput
                label="Location"
                mode="outlined"
                placeholder="e.g., Cape Town, Western Cape"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={!!errors.location}
                style={styles.input}
                left={<TextInput.Icon icon="location-outline" />}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
            </View>
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
            <View style={styles.inputGroup}>
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
                left={<TextInput.Icon icon="call-outline" />}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
              {errors.phone && (
                <HelperText type="error" visible={!!errors.phone}>
                  {errors.phone.message}
                </HelperText>
              )}
            </View>
          )}
        />
      </Surface>

      {/* Online Presence Section */}
      <Surface style={styles.section} elevation={0}>
        <View style={styles.sectionHeader}>
          <Ionicons name="globe" size={20} color={colors.primary} />
          <Text style={styles.sectionTitle}>Online Presence</Text>
        </View>

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
            <View style={styles.inputGroup}>
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
                left={<TextInput.Icon icon="logo-linkedin" />}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
              {errors.linkedinUrl && (
                <HelperText type="error" visible={!!errors.linkedinUrl}>
                  {errors.linkedinUrl.message}
                </HelperText>
              )}
            </View>
          )}
        />

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
            <View style={styles.inputGroup}>
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
                left={<TextInput.Icon icon="link-outline" />}
                outlineColor={colors.border}
                activeOutlineColor={colors.primary}
              />
              {errors.portfolioUrl && (
                <HelperText type="error" visible={!!errors.portfolioUrl}>
                  {errors.portfolioUrl.message}
                </HelperText>
              )}
            </View>
          )}
        />
      </Surface>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
          disabled={isSubmitting}
          textColor={colors.textSecondary}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={onSubmit}
          loading={isSubmitting}
          disabled={isSubmitting || !isDirty}
          style={[styles.actionButton, styles.saveButton]}
          buttonColor={colors.primary}
          icon="checkmark-circle"
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </View>

      {/* Helpful hint */}
      {isDirty && (
        <View style={styles.hint}>
          <Ionicons name="information-circle" size={16} color={colors.info} />
          <Text style={styles.hintText}>
            You have unsaved changes. Remember to save before leaving!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Section Styles
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primaryLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },

  // Input Styles
  inputGroup: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
  },
  textArea: {
    minHeight: 100,
  },

  // Action Buttons
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
  },
  saveButton: {
    ...shadows.md,
  },

  // Hint
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.infoLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: colors.info,
    fontWeight: '500',
  },
});

export default PersonalInfoForm;
