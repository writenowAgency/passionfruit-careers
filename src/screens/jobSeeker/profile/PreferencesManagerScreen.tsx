import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Text, Chip, ActivityIndicator, Switch, SegmentedButtons, TextInput, Button as PaperButton } from 'react-native-paper';
import { useAppSelector } from '../../../store/hooks';
import { profileApi } from '../../../services/profileApi';
import { PrimaryButton } from '../../../components/PrimaryButton';
import DateTimePicker from '@react-native-community/datetimepicker';

interface JobCategory {
  id: number;
  categoryName: string;
  description: string | null;
}

export function PreferencesManagerScreen() {
  const token = useAppSelector((state) => state.auth.token);
  const profile = useAppSelector((state) => state.profile.data);

  // Job Categories
  const [allCategories, setAllCategories] = useState<JobCategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Work Preferences
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [workType, setWorkType] = useState<'remote' | 'office' | 'hybrid' | ''>('');
  const [availabilityDate, setAvailabilityDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Notification Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Load all available job categories
      const categoriesResponse = await profileApi.getAllJobCategories(token);
      setAllCategories(categoriesResponse.categories);

      // Load existing preferences from profile
      if (profile) {
        setSelectedCategories(profile.preferredJobCategories.map(c => c.id));
        setSalaryMin(profile.profile.desiredSalaryMin?.toString() || '');
        setSalaryMax(profile.profile.desiredSalaryMax?.toString() || '');
        setCurrency(profile.profile.salaryCurrency || 'USD');
        setWorkType(profile.profile.preferredWorkType || '');
        setAvailabilityDate(profile.profile.availabilityStartDate ? new Date(profile.profile.availabilityStartDate) : null);

        setEmailNotifications(profile.preferences.emailNotificationsEnabled);
        setPushNotifications(profile.preferences.pushNotificationsEnabled);
        setJobAlerts(profile.preferences.jobAlertsEnabled);
        setApplicationUpdates(profile.preferences.applicationUpdatesEnabled);
        setMarketingEmails(profile.preferences.marketingEmailsEnabled);
      }
    } catch (error) {
      console.error('Load preferences error:', error);
      Alert.alert('Error', 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategory = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSaveJobCategories = async () => {
    if (!token) return;

    try {
      setSaving(true);
      await profileApi.updatePreferredCategories(token, selectedCategories);
      Alert.alert('Success', 'Job categories updated successfully');
    } catch (error: any) {
      console.error('Save job categories error:', error);
      Alert.alert('Error', error.message || 'Failed to save job categories');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWorkPreferences = async () => {
    if (!token) return;

    try {
      setSaving(true);
      await profileApi.updateWorkPreferences(token, {
        desiredSalaryMin: salaryMin ? parseInt(salaryMin) : null,
        desiredSalaryMax: salaryMax ? parseInt(salaryMax) : null,
        salaryCurrency: currency,
        preferredWorkType: workType || null,
        availabilityStartDate: availabilityDate ? availabilityDate.toISOString().split('T')[0] : null,
      });
      Alert.alert('Success', 'Work preferences updated successfully');
    } catch (error: any) {
      console.error('Save work preferences error:', error);
      Alert.alert('Error', error.message || 'Failed to save work preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotificationPreferences = async () => {
    if (!token) return;

    try {
      setSaving(true);
      await profileApi.updateNotificationPreferences(token, {
        emailNotificationsEnabled: emailNotifications,
        pushNotificationsEnabled: pushNotifications,
        jobAlertsEnabled: jobAlerts,
        applicationUpdatesEnabled: applicationUpdates,
        marketingEmailsEnabled: marketingEmails,
      });
      Alert.alert('Success', 'Notification preferences updated successfully');
    } catch (error: any) {
      console.error('Save notification preferences error:', error);
      Alert.alert('Error', error.message || 'Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium">Job Preferences</Text>
        <Text variant="bodyMedium" style={{ color: 'gray', marginTop: 8 }}>
          Customize your job search preferences
        </Text>
      </View>

      {/* Desired Job Categories */}
      <Card style={styles.card}>
        <Card.Title title="Desired Job Categories" subtitle="Select the types of jobs you're interested in" />
        <Card.Content>
          <View style={styles.chipsContainer}>
            {allCategories.map((category) => (
              <Chip
                key={category.id}
                selected={selectedCategories.includes(category.id)}
                onPress={() => handleToggleCategory(category.id)}
                style={{ marginBottom: 8, marginRight: 8 }}
              >
                {category.categoryName}
              </Chip>
            ))}
          </View>
          <PrimaryButton
            onPress={handleSaveJobCategories}
            disabled={saving}
            style={{ marginTop: 16 }}
          >
            {saving ? 'Saving...' : 'Save Job Categories'}
          </PrimaryButton>
        </Card.Content>
      </Card>

      {/* Salary Expectations */}
      <Card style={styles.card}>
        <Card.Title title="Salary Expectations" subtitle="Set your desired salary range" />
        <Card.Content>
          <View style={{ marginBottom: 16 }}>
            <Text variant="labelMedium" style={{ marginBottom: 8 }}>Currency</Text>
            <SegmentedButtons
              value={currency}
              onValueChange={setCurrency}
              buttons={[
                { value: 'USD', label: 'USD' },
                { value: 'EUR', label: 'EUR' },
                { value: 'GBP', label: 'GBP' },
                { value: 'ZAR', label: 'ZAR' },
              ]}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Minimum Salary"
                value={salaryMin}
                onChangeText={setSalaryMin}
                keyboardType="numeric"
                mode="outlined"
              />
            </View>
            <View style={{ flex: 1 }}>
              <TextInput
                label="Maximum Salary"
                value={salaryMax}
                onChangeText={setSalaryMax}
                keyboardType="numeric"
                mode="outlined"
              />
            </View>
          </View>

          <PrimaryButton onPress={handleSaveWorkPreferences} disabled={saving}>
            {saving ? 'Saving...' : 'Save Salary Preferences'}
          </PrimaryButton>
        </Card.Content>
      </Card>

      {/* Work Type */}
      <Card style={styles.card}>
        <Card.Title title="Work Type Preference" subtitle="Choose your preferred work arrangement" />
        <Card.Content>
          <SegmentedButtons
            value={workType}
            onValueChange={(value) => setWorkType(value as any)}
            buttons={[
              { value: 'remote', label: 'Remote' },
              { value: 'office', label: 'Office' },
              { value: 'hybrid', label: 'Hybrid' },
            ]}
          />
          <PrimaryButton
            onPress={handleSaveWorkPreferences}
            disabled={saving}
            style={{ marginTop: 16 }}
          >
            {saving ? 'Saving...' : 'Save Work Type'}
          </PrimaryButton>
        </Card.Content>
      </Card>

      {/* Availability */}
      <Card style={styles.card}>
        <Card.Title title="Availability" subtitle="When can you start a new role?" />
        <Card.Content>
          <PaperButton
            mode="outlined"
            onPress={() => setShowDatePicker(true)}
            style={{ marginBottom: 16 }}
          >
            {availabilityDate
              ? `Available from: ${availabilityDate.toLocaleDateString()}`
              : 'Set Availability Date'}
          </PaperButton>

          {showDatePicker && (
            <DateTimePicker
              value={availabilityDate || new Date()}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setAvailabilityDate(selectedDate);
                }
              }}
            />
          )}

          <PrimaryButton onPress={handleSaveWorkPreferences} disabled={saving}>
            {saving ? 'Saving...' : 'Save Availability'}
          </PrimaryButton>
        </Card.Content>
      </Card>

      {/* Notification Settings */}
      <Card style={styles.card}>
        <Card.Title title="Notification Settings" subtitle="Manage how you receive updates" />
        <Card.Content>
          <View style={styles.switchRow}>
            <Text>Email Notifications</Text>
            <Switch value={emailNotifications} onValueChange={setEmailNotifications} />
          </View>

          <View style={styles.switchRow}>
            <Text>Push Notifications</Text>
            <Switch value={pushNotifications} onValueChange={setPushNotifications} />
          </View>

          <View style={styles.switchRow}>
            <Text>Job Alerts</Text>
            <Switch value={jobAlerts} onValueChange={setJobAlerts} />
          </View>

          <View style={styles.switchRow}>
            <Text>Application Updates</Text>
            <Switch value={applicationUpdates} onValueChange={setApplicationUpdates} />
          </View>

          <View style={styles.switchRow}>
            <Text>Marketing Emails</Text>
            <Switch value={marketingEmails} onValueChange={setMarketingEmails} />
          </View>

          <PrimaryButton
            onPress={handleSaveNotificationPreferences}
            disabled={saving}
            style={{ marginTop: 16 }}
          >
            {saving ? 'Saving...' : 'Save Notification Settings'}
          </PrimaryButton>
        </Card.Content>
      </Card>

      <View style={{ marginBottom: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
});
