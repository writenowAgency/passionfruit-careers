import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { Text, Card, Switch, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { ScaleUp } from '@/components/animations/ScaleUp';

interface NotificationSettings {
  // Email Notifications
  emailNewApplications: boolean;
  emailApplicationUpdates: boolean;
  emailJobExpiring: boolean;
  emailWeeklySummary: boolean;
  emailMarketingUpdates: boolean;

  // Push Notifications
  pushNewApplications: boolean;
  pushApplicationUpdates: boolean;
  pushJobExpiring: boolean;
  pushMessages: boolean;

  // SMS Notifications
  smsUrgentAlerts: boolean;
  smsImportantUpdates: boolean;
}

const NotificationPreferencesScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNewApplications: true,
    emailApplicationUpdates: true,
    emailJobExpiring: true,
    emailWeeklySummary: false,
    emailMarketingUpdates: false,
    pushNewApplications: true,
    pushApplicationUpdates: false,
    pushJobExpiring: true,
    pushMessages: true,
    smsUrgentAlerts: false,
    smsImportantUpdates: false,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to save notification preferences
      await new Promise((resolve) => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Notification preferences saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <FadeIn delay={0}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="notifications" size={32} color={colors.secondary} />
          </View>
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={styles.title}>
              Notification Preferences
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Choose how you want to be notified about important updates
            </Text>
          </View>
        </View>
      </FadeIn>

      {/* Email Notifications */}
      <ScaleUp delay={50}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="mail" size={24} color={colors.primary} />
              <Text variant="titleLarge" style={styles.cardTitle}>
                Email Notifications
              </Text>
            </View>

            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    New Applications
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Get notified when someone applies to your job postings
                  </Text>
                </View>
                <Switch
                  value={settings.emailNewApplications}
                  onValueChange={() => toggleSetting('emailNewApplications')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Application Updates
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Updates on applications you've reviewed or shortlisted
                  </Text>
                </View>
                <Switch
                  value={settings.emailApplicationUpdates}
                  onValueChange={() => toggleSetting('emailApplicationUpdates')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Job Expiring Soon
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Reminders when your job postings are about to expire
                  </Text>
                </View>
                <Switch
                  value={settings.emailJobExpiring}
                  onValueChange={() => toggleSetting('emailJobExpiring')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Weekly Summary
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    A weekly digest of your recruitment activity
                  </Text>
                </View>
                <Switch
                  value={settings.emailWeeklySummary}
                  onValueChange={() => toggleSetting('emailWeeklySummary')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Marketing Updates
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    New features, tips, and special offers
                  </Text>
                </View>
                <Switch
                  value={settings.emailMarketingUpdates}
                  onValueChange={() => toggleSetting('emailMarketingUpdates')}
                  color={colors.primary}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>

      {/* Push Notifications */}
      <ScaleUp delay={100}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="phone-portrait" size={24} color={colors.secondary} />
              <Text variant="titleLarge" style={styles.cardTitle}>
                Push Notifications
              </Text>
            </View>

            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    New Applications
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Instant alerts for new applications
                  </Text>
                </View>
                <Switch
                  value={settings.pushNewApplications}
                  onValueChange={() => toggleSetting('pushNewApplications')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Application Updates
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Status changes on applications
                  </Text>
                </View>
                <Switch
                  value={settings.pushApplicationUpdates}
                  onValueChange={() => toggleSetting('pushApplicationUpdates')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Job Expiring Soon
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Reminders for expiring job postings
                  </Text>
                </View>
                <Switch
                  value={settings.pushJobExpiring}
                  onValueChange={() => toggleSetting('pushJobExpiring')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Messages
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    New messages from candidates
                  </Text>
                </View>
                <Switch
                  value={settings.pushMessages}
                  onValueChange={() => toggleSetting('pushMessages')}
                  color={colors.primary}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>

      {/* SMS Notifications */}
      <ScaleUp delay={150}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="chatbubble" size={24} color={colors.info} />
              <Text variant="titleLarge" style={styles.cardTitle}>
                SMS Notifications
              </Text>
            </View>

            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Urgent Alerts
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    Critical notifications that require immediate attention
                  </Text>
                </View>
                <Switch
                  value={settings.smsUrgentAlerts}
                  onValueChange={() => toggleSetting('smsUrgentAlerts')}
                  color={colors.primary}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text variant="bodyLarge" style={styles.settingTitle}>
                    Important Updates
                  </Text>
                  <Text variant="bodySmall" style={styles.settingDescription}>
                    High-priority recruitment updates
                  </Text>
                </View>
                <Switch
                  value={settings.smsImportantUpdates}
                  onValueChange={() => toggleSetting('smsImportantUpdates')}
                  color={colors.primary}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>

      {/* Save Button */}
      <FadeIn delay={200}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          buttonColor={colors.primary}
          textColor={colors.background}
        >
          Save Preferences
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
    backgroundColor: `${colors.secondary}15`,
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
    marginBottom: spacing.lg,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
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
  saveButton: {
    marginBottom: spacing.lg,
  },
});

export default NotificationPreferencesScreen;
