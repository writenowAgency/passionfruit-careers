import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Image } from 'react-native';
import { Text, Card, TextInput, Button, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { employerApi } from '@/services/employerApi';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';

interface CompanyProfile {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  address: string;
  description: string;
  email: string;
  phone: string;
}

const CompanyProfileScreen: React.FC = () => {
  const token = useAppSelector((state) => state.auth.token);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    address: '',
    description: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [token])
  );

  const fetchProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await employerApi.getProfile(token);

      setProfile({
        companyName: data.companyName || '',
        industry: data.industry || '',
        companySize: data.companySize || '',
        website: data.website || '',
        address: data.address || '',
        description: data.description || '',
        email: data.email || '',
        phone: data.phone || '',
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setSnackbarMessage('Failed to load company profile');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;

    // Validation
    if (!profile.companyName.trim()) {
      setSnackbarMessage('Company name is required');
      setSnackbarVisible(true);
      return;
    }

    if (!profile.email.trim()) {
      setSnackbarMessage('Contact email is required');
      setSnackbarVisible(true);
      return;
    }

    try {
      setSaving(true);
      await employerApi.updateProfile(token, profile);
      setSnackbarMessage('Company profile updated successfully');
      setSnackbarVisible(true);
      // Refetch profile to ensure UI reflects saved data
      await fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSnackbarMessage('Failed to update company profile');
      setSnackbarVisible(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="business" size={32} color={colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text variant="headlineSmall" style={styles.title}>
                Company Profile
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Manage your company information and public profile
              </Text>
            </View>
          </View>
        </FadeIn>

        <FadeIn delay={50}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Basic Information
              </Text>

              <View style={styles.formGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Company Name *
                </Text>
                <TextInput
                  value={profile.companyName}
                  onChangeText={(text) => setProfile({ ...profile, companyName: text })}
                  mode="outlined"
                  placeholder="Enter company name"
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Industry
                </Text>
                <TextInput
                  value={profile.industry}
                  onChangeText={(text) => setProfile({ ...profile, industry: text })}
                  mode="outlined"
                  placeholder="e.g., Technology, Healthcare, Finance"
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Company Size
                </Text>
                <TextInput
                  value={profile.companySize}
                  onChangeText={(text) => setProfile({ ...profile, companySize: text })}
                  mode="outlined"
                  placeholder="e.g., 1-10, 11-50, 51-200, 200+"
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Location
                </Text>
                <TextInput
                  value={profile.address}
                  onChangeText={(text) => setProfile({ ...profile, address: text })}
                  mode="outlined"
                  placeholder="e.g., Johannesburg, South Africa"
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  left={<TextInput.Icon icon={() => <Ionicons name="location" size={20} color={colors.textSecondary} />} />}
                />
              </View>

              <View style={styles.formGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Website
                </Text>
                <TextInput
                  value={profile.website}
                  onChangeText={(text) => setProfile({ ...profile, website: text })}
                  mode="outlined"
                  placeholder="https://www.yourcompany.com"
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  keyboardType="url"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon={() => <Ionicons name="globe" size={20} color={colors.textSecondary} />} />}
                />
              </View>
            </Card.Content>
          </Card>
        </FadeIn>

        <FadeIn delay={100}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Company Description
              </Text>

              <View style={styles.formGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  About Your Company
                </Text>
                <TextInput
                  value={profile.description}
                  onChangeText={(text) => setProfile({ ...profile, description: text })}
                  mode="outlined"
                  placeholder="Tell candidates about your company, culture, and what makes you unique..."
                  style={[styles.input, styles.textArea]}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  multiline
                  numberOfLines={6}
                />
                <Text variant="bodySmall" style={styles.helperText}>
                  This will be shown to job seekers when they view your job postings
                </Text>
              </View>
            </Card.Content>
          </Card>
        </FadeIn>

        <FadeIn delay={150}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Contact Information
              </Text>

              <View style={styles.formGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Contact Email *
                </Text>
                <TextInput
                  value={profile.email}
                  onChangeText={(text) => setProfile({ ...profile, email: text })}
                  mode="outlined"
                  placeholder="contact@yourcompany.com"
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon={() => <Ionicons name="mail" size={20} color={colors.textSecondary} />} />}
                />
              </View>

              <View style={styles.formGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Contact Phone
                </Text>
                <TextInput
                  value={profile.phone}
                  onChangeText={(text) => setProfile({ ...profile, phone: text })}
                  mode="outlined"
                  placeholder="+27 11 234 5678"
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  keyboardType="phone-pad"
                  left={<TextInput.Icon icon={() => <Ionicons name="call" size={20} color={colors.textSecondary} />} />}
                />
              </View>
            </Card.Content>
          </Card>
        </FadeIn>

        <FadeIn delay={200}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving || loading}
            style={styles.saveButton}
            buttonColor={colors.primary}
            textColor={colors.background}
            icon={() => <Ionicons name="checkmark-circle" size={20} color={colors.background} />}
          >
            Save Changes
          </Button>
        </FadeIn>
      </ScrollView>

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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
  },
  textArea: {
    minHeight: 120,
  },
  helperText: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  saveButton: {
    marginBottom: spacing.lg,
  },
});

export default CompanyProfileScreen;
