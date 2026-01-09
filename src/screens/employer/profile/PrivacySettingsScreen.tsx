import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert, Pressable } from 'react-native';
import { Text, Card, Switch, Button, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { ScaleUp } from '@/components/animations/ScaleUp';

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'recruiters-only';
  showCompanyLogo: boolean;
  showCompanyDetails: boolean;
  showJobHistory: boolean;
  allowSearchEngineIndexing: boolean;
  shareDataForImprovement: boolean;
  receivePersonalizedRecommendations: boolean;
  twoFactorAuthentication: boolean;
}

const PrivacySettingsScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showCompanyLogo: true,
    showCompanyDetails: true,
    showJobHistory: true,
    allowSearchEngineIndexing: true,
    shareDataForImprovement: false,
    receivePersonalizedRecommendations: true,
    twoFactorAuthentication: false,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save privacy settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Privacy settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof Omit<PrivacySettings, 'profileVisibility'>) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setProfileVisibility = (visibility: PrivacySettings['profileVisibility']) => {
    setSettings((prev) => ({ ...prev, profileVisibility: visibility }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download Your Data',
      'We will prepare a copy of your data and send it to your registered email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Download',
          onPress: () => {
            Alert.alert('Success', 'Your data export request has been submitted.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <FadeIn delay={0}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={32} color={colors.success} />
          </View>
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.title}>
              Privacy Settings
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Control who can see your information and how it's used
            </Text>
          </View>
        </View>
      </FadeIn>

      {/* Profile Visibility */}
      <ScaleUp delay={50}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="eye" size={24} color={colors.primary} />
              <Text variant="titleLarge" style={styles.cardTitle}>
                Profile Visibility
              </Text>
            </View>

            <Text variant="bodyMedium" style={styles.sectionDescription}>
              Choose who can see your company profile
            </Text>

            <View style={styles.visibilityOptions}>
              <Pressable
                style={[
                  styles.visibilityOption,
                  settings.profileVisibility === 'public' && styles.visibilityOptionActive,
                ]}
                onPress={() => setProfileVisibility('public')}
              >
                <View style={styles.visibilityOptionHeader}>
                  <Ionicons
                    name="globe"
                    size={20}
                    color={
                      settings.profileVisibility === 'public' ? colors.primary : colors.textSecondary
                    }
                  />
                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.visibilityOptionTitle,
                      settings.profileVisibility === 'public' && styles.visibilityOptionTitleActive,
                    ]}
                  >
                    Public
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.visibilityOptionDescription}>
                  Your profile is visible to everyone
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.visibilityOption,
                  settings.profileVisibility === 'recruiters-only' &&
                    styles.visibilityOptionActive,
                ]}
                onPress={() => setProfileVisibility('recruiters-only')}
              >
                <View style={styles.visibilityOptionHeader}>
                  <Ionicons
                    name="people"
                    size={20}
                    color={
                      settings.profileVisibility === 'recruiters-only'
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.visibilityOptionTitle,
                      settings.profileVisibility === 'recruiters-only' &&
                        styles.visibilityOptionTitleActive,
                    ]}
                  >
                    Job Seekers Only
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.visibilityOptionDescription}>
                  Only job seekers can see your profile
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.visibilityOption,
                  settings.profileVisibility === 'private' && styles.visibilityOptionActive,
                ]}
                onPress={() => setProfileVisibility('private')}
              >
                <View style={styles.visibilityOptionHeader}>
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={
                      settings.profileVisibility === 'private'
                        ? colors.primary
                        : colors.textSecondary
                    }
                  />
                  <Text
                    variant="bodyLarge"
                    style={[
                      styles.visibilityOptionTitle,
                      settings.profileVisibility === 'private' &&
                        styles.visibilityOptionTitleActive,
                    ]}
                  >
                    Private
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.visibilityOptionDescription}>
                  Your profile is hidden from public view
                </Text>
              </Pressable>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>

      {/* Public Information */}
      <ScaleUp delay={100}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color={colors.secondary} />
              <Text variant="titleLarge" style={styles.cardTitle}>
                Public Information
              </Text>
            </View>

            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Show Company Logo
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Display your company logo on job postings
                  </Text>
                </View>
                <Switch
                  value={settings.showCompanyLogo}
                  onValueChange={() => toggleSetting('showCompanyLogo')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Show Company Details
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Display company size, industry, and location
                  </Text>
                </View>
                <Switch
                  value={settings.showCompanyDetails}
                  onValueChange={() => toggleSetting('showCompanyDetails')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Show Job History
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Display previous job postings
                  </Text>
                </View>
                <Switch
                  value={settings.showJobHistory}
                  onValueChange={() => toggleSetting('showJobHistory')}
                  color={colors.primary}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>

      {/* Data & Privacy */}
      <ScaleUp delay={150}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="shield" size={24} color={colors.info} />
              <Text variant="titleLarge" style={styles.cardTitle}>
                Data & Privacy
              </Text>
            </View>

            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Search Engine Indexing
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Allow search engines to index your profile
                  </Text>
                </View>
                <Switch
                  value={settings.allowSearchEngineIndexing}
                  onValueChange={() => toggleSetting('allowSearchEngineIndexing')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Product Improvement
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Share anonymous usage data to help improve our platform
                  </Text>
                </View>
                <Switch
                  value={settings.shareDataForImprovement}
                  onValueChange={() => toggleSetting('shareDataForImprovement')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Personalized Recommendations
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Receive personalized candidate recommendations
                  </Text>
                </View>
                <Switch
                  value={settings.receivePersonalizedRecommendations}
                  onValueChange={() => toggleSetting('receivePersonalizedRecommendations')}
                  color={colors.primary}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>

      {/* Security */}
      <ScaleUp delay={200}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="lock-closed" size={24} color={colors.accent} />
              <Text variant="titleLarge" style={styles.cardTitle}>
                Security
              </Text>
            </View>

            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Two-Factor Authentication
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Add an extra layer of security to your account
                  </Text>
                </View>
                <Switch
                  value={settings.twoFactorAuthentication}
                  onValueChange={() => toggleSetting('twoFactorAuthentication')}
                  color={colors.primary}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>

      {/* Data Management */}
      <ScaleUp delay={250}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={24} color={colors.warning} />
              <Text variant="titleLarge" style={styles.cardTitle}>
                Data Management
              </Text>
            </View>

            <View style={styles.dataActions}>
              <Pressable style={styles.dataAction} onPress={handleDownloadData}>
                <Ionicons name="download" size={20} color={colors.info} />
                <Text variant="bodyLarge" style={styles.dataActionText}>
                  Download Your Data
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>

              <View style={styles.divider} />

              <Pressable style={styles.dataAction} onPress={handleDeleteAccount}>
                <Ionicons name="trash" size={20} color={colors.error} />
                <Text variant="bodyLarge" style={[styles.dataActionText, styles.dangerText]}>
                  Delete Account
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>

      {/* Save Button */}
      <FadeIn delay={300}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          buttonColor={colors.primary}
          textColor={colors.background}
        >
          Save Settings
        </Button>
      </FadeIn>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
    backgroundColor: `${colors.success}15`,
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
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  sectionDescription: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  visibilityOptions: {
    gap: spacing.sm,
  },
  visibilityOption: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  visibilityOptionActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}05`,
  },
  visibilityOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  visibilityOptionTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  visibilityOptionTitleActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  visibilityOptionDescription: {
    color: colors.textSecondary,
    marginLeft: 28,
  },
  settingsList: {
    gap: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLeft: {
    flex: 1,
    gap: spacing.xs,
  },
  settingTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  settingDescription: {
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  dataActions: {
    gap: spacing.sm,
  },
  dataAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
  },
  dataActionText: {
    flex: 1,
    color: colors.text,
    fontWeight: '600',
  },
  dangerText: {
    color: colors.error,
  },
  saveButton: {
    marginBottom: spacing.lg,
  },
});

export default PrivacySettingsScreen;
