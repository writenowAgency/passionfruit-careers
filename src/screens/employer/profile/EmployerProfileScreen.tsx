import React, { useState, useRef } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, Pressable, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { Text, Card, TextInput, Button, Avatar, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '@/store/hooks';
import { employerApi } from '@/services/employerApi';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { ScaleUp } from '@/components/animations/ScaleUp';

type ProfileStackParamList = {
  EmployerProfile: undefined;
  ChangePassword: undefined;
  NotificationPreferences: undefined;
  PrivacySettings: undefined;
};

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface CompanyProfile {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  logo: string | null;
  linkedIn: string;
  twitter: string;
  facebook: string;
}

const EmployerProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const user = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Profile state - start empty, will be loaded from API
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    country: '',
    logo: null,
    linkedIn: '',
    twitter: '',
    facebook: '',
  });

  const industries = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'Retail',
    'Manufacturing',
    'Other',
  ];

  const companySizes = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+',
  ];

  // Load profile data on mount
  React.useEffect(() => {
    console.log('EmployerProfileScreen mounted, token exists:', !!token);
    if (token) {
      loadProfile();
    }
  }, [token]);

  const loadProfile = async () => {
    if (!token) {
      console.log('No token available for loading profile');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching profile from API...');
      const data = await employerApi.getProfile(token);
      console.log('=== LOADED PROFILE DATA ===');
      console.log('Raw data from API:', JSON.stringify(data, null, 2));

      // Use actual data from backend, don't override with defaults
      const newProfile = {
        companyName: data.companyName || '',
        industry: data.industry || '',
        companySize: data.companySize || '',
        website: data.website || '',
        description: data.description || '',
        email: data.email || user?.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        logo: data.logo || null,
        linkedIn: data.linkedIn || '',
        twitter: data.twitter || '',
        facebook: data.facebook || '',
      };

      console.log('Setting profile state to:', JSON.stringify(newProfile, null, 2));
      setProfile(newProfile);
      console.log('Profile state updated');
    } catch (error) {
      console.error('=== FAILED TO LOAD PROFILE ===');
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) {
      Alert.alert('Error', 'No authentication token found');
      return;
    }

    setSaving(true);
    try {
      console.log('=== SAVING PROFILE ===');
      console.log('Profile data to save:', JSON.stringify(profile, null, 2));

      const response = await employerApi.updateProfile(token, {
        companyName: profile.companyName,
        industry: profile.industry,
        companySize: profile.companySize,
        website: profile.website,
        description: profile.description,
        phone: profile.phone,
        address: profile.address,
        logo: profile.logo,
      });

      console.log('Profile saved successfully:', response);

      // Reload the profile to verify the save
      console.log('Reloading profile to verify save...');
      await loadProfile();

      Alert.alert('Success', 'Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      console.error('=== SAVE PROFILE ERROR ===');
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    // Reload the original profile data
    console.log('Cancel edit - reloading original profile data');
    await loadProfile();
    setEditMode(false);
  };

  const handleUploadLogo = async () => {
    console.log('handleUploadLogo called');

    // On web, use file input
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
      return;
    }

    // On mobile, use expo-image-picker
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a logo');
        return;
      }

      Alert.alert(
        'Upload Company Logo',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
              if (!cameraPermission.granted) {
                Alert.alert('Permission Required', 'Please allow camera access to take a photo');
                return;
              }
              pickImage(true);
            },
          },
          {
            text: 'Choose from Gallery',
            onPress: () => pickImage(false),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading logo:', error);
      Alert.alert('Error', 'Failed to upload logo');
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfile({ ...profile, logo: imageUri });
        Alert.alert('Success', 'Logo updated successfully');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Create a local URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, logo: reader.result as string });
        alert('Logo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyLarge" style={{ marginTop: spacing.md, color: colors.textSecondary }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hidden file input for web */}
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef as any}
          type="file"
          accept="image/*"
          onChange={handleFileChange as any}
          style={{ display: 'none' }}
        />
      )}

      {/* Header Section */}
      <FadeIn delay={0}>
        <LinearGradient
          colors={['#FFF9E6', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View style={styles.logoSection}>
              <Pressable
                onPress={editMode ? handleUploadLogo : undefined}
                style={({ pressed }) => [
                  styles.logoPressable,
                  editMode && { cursor: 'pointer' as any },
                  pressed && editMode && { opacity: 0.7 },
                ]}
              >
                <View style={styles.logoContainer}>
                  {profile.logo ? (
                    <Image source={{ uri: profile.logo }} style={styles.logo} />
                  ) : (
                    <Avatar.Text
                      size={100}
                      label={profile.companyName.substring(0, 2).toUpperCase()}
                      style={styles.avatar}
                    />
                  )}
                  {editMode && (
                    <View style={styles.uploadBadge}>
                      <Ionicons name="camera" size={20} color={colors.background} />
                    </View>
                  )}
                </View>
              </Pressable>
              <View style={styles.companyInfo}>
                <Text variant="headlineMedium" style={styles.companyName}>
                  {profile.companyName}
                </Text>
                <View style={styles.companyMeta}>
                  <Chip mode="flat" style={styles.chip} textStyle={styles.chipText}>
                    {profile.industry || '(Industry not set)'}
                  </Chip>
                  <Chip mode="flat" style={styles.chip} textStyle={styles.chipText}>
                    {profile.companySize ? `${profile.companySize} employees` : '(Size not set)'}
                  </Chip>
                </View>
              </View>
            </View>

            {!editMode ? (
              <Pressable style={styles.editButton} onPress={() => setEditMode(true)}>
                <Ionicons name="pencil" size={20} color={colors.background} />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </Pressable>
            ) : (
              <View style={styles.actionButtons}>
                <Pressable
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </LinearGradient>
      </FadeIn>

      {/* Company Information */}
      <ScaleUp delay={50}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="business" size={24} color={colors.primary} />
                <Text variant="titleLarge" style={styles.cardTitle}>
                  Company Information
                </Text>
              </View>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.formField}>
                <Text variant="labelMedium" style={styles.fieldLabel}>
                  Company Name
                </Text>
                {editMode ? (
                  <TextInput
                    value={profile.companyName}
                    onChangeText={(text) => setProfile({ ...profile, companyName: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                  />
                ) : (
                  <Text variant="bodyLarge" style={styles.fieldValue}>
                    {profile.companyName}
                  </Text>
                )}
              </View>

              <View style={styles.formField}>
                <Text variant="labelMedium" style={styles.fieldLabel}>
                  Industry
                </Text>
                {editMode ? (
                  <View style={styles.chipGroup}>
                    {industries.map((industry) => (
                      <Chip
                        key={industry}
                        selected={profile.industry === industry}
                        onPress={() => setProfile({ ...profile, industry })}
                        style={[
                          styles.selectChip,
                          profile.industry === industry && styles.selectChipActive,
                        ]}
                        textStyle={styles.selectChipText}
                      >
                        {industry}
                      </Chip>
                    ))}
                  </View>
                ) : (
                  <Text variant="bodyLarge" style={styles.fieldValue}>
                    {profile.industry}
                  </Text>
                )}
              </View>

              <View style={styles.formField}>
                <Text variant="labelMedium" style={styles.fieldLabel}>
                  Company Size
                </Text>
                {editMode ? (
                  <View style={styles.chipGroup}>
                    {companySizes.map((size) => (
                      <Chip
                        key={size}
                        selected={profile.companySize === size}
                        onPress={() => setProfile({ ...profile, companySize: size })}
                        style={[
                          styles.selectChip,
                          profile.companySize === size && styles.selectChipActive,
                        ]}
                        textStyle={styles.selectChipText}
                      >
                        {size}
                      </Chip>
                    ))}
                  </View>
                ) : (
                  <Text variant="bodyLarge" style={styles.fieldValue}>
                    {profile.companySize} employees
                  </Text>
                )}
              </View>

              <View style={styles.formField}>
                <Text variant="labelMedium" style={styles.fieldLabel}>
                  Website
                </Text>
                {editMode ? (
                  <TextInput
                    value={profile.website}
                    onChangeText={(text) => setProfile({ ...profile, website: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    keyboardType="url"
                  />
                ) : (
                  <Text variant="bodyLarge" style={[styles.fieldValue, styles.linkText]}>
                    {profile.website}
                  </Text>
                )}
              </View>

              <View style={[styles.formField, styles.fullWidth]}>
                <Text variant="labelMedium" style={styles.fieldLabel}>
                  Company Description
                </Text>
                {editMode ? (
                  <TextInput
                    value={profile.description}
                    onChangeText={(text) => setProfile({ ...profile, description: text })}
                    mode="outlined"
                    style={[styles.input, styles.textArea]}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    multiline
                    numberOfLines={4}
                  />
                ) : (
                  <Text variant="bodyLarge" style={styles.fieldValue}>
                    {profile.description}
                  </Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>

      {/* Contact Information */}
      <ScaleUp delay={100}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="mail" size={24} color={colors.secondary} />
                <Text variant="titleLarge" style={styles.cardTitle}>
                  Contact Information
                </Text>
              </View>
            </View>

            <View style={styles.formGrid}>
              <View style={styles.formField}>
                <Text variant="labelMedium" style={styles.fieldLabel}>
                  Email
                </Text>
                {editMode ? (
                  <TextInput
                    value={profile.email}
                    onChangeText={(text) => setProfile({ ...profile, email: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    keyboardType="email-address"
                  />
                ) : (
                  <Text variant="bodyLarge" style={styles.fieldValue}>
                    {profile.email}
                  </Text>
                )}
              </View>

              <View style={styles.formField}>
                <Text variant="labelMedium" style={styles.fieldLabel}>
                  Phone
                </Text>
                {editMode ? (
                  <TextInput
                    value={profile.phone}
                    onChangeText={(text) => setProfile({ ...profile, phone: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    keyboardType="phone-pad"
                  />
                ) : (
                  <Text variant="bodyLarge" style={styles.fieldValue}>
                    {profile.phone}
                  </Text>
                )}
              </View>

              <View style={styles.formField}>
                <Text variant="labelMedium" style={styles.fieldLabel}>
                  Address
                </Text>
                {editMode ? (
                  <TextInput
                    value={profile.address}
                    onChangeText={(text) => setProfile({ ...profile, address: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                  />
                ) : (
                  <Text variant="bodyLarge" style={styles.fieldValue}>
                    {profile.address}
                  </Text>
                )}
              </View>

              <View style={styles.formField}>
                <Text variant="labelMedium" style={styles.fieldLabel}>
                  City
                </Text>
                {editMode ? (
                  <TextInput
                    value={profile.city}
                    onChangeText={(text) => setProfile({ ...profile, city: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                  />
                ) : (
                  <Text variant="bodyLarge" style={styles.fieldValue}>
                    {profile.city}
                  </Text>
                )}
              </View>

              <View style={styles.formField}>
                <Text variant="labelMedium" style={styles.fieldLabel}>
                  Country
                </Text>
                {editMode ? (
                  <TextInput
                    value={profile.country}
                    onChangeText={(text) => setProfile({ ...profile, country: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                  />
                ) : (
                  <Text variant="bodyLarge" style={styles.fieldValue}>
                    {profile.country}
                  </Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>

      {/* Social Media */}
      <ScaleUp delay={150}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="share-social" size={24} color={colors.info} />
                <Text variant="titleLarge" style={styles.cardTitle}>
                  Social Media
                </Text>
              </View>
            </View>

            <View style={styles.formGrid}>
              <View style={[styles.formField, styles.fullWidth]}>
                <View style={styles.socialFieldHeader}>
                  <Ionicons name="logo-linkedin" size={20} color="#0077B5" />
                  <Text variant="labelMedium" style={styles.fieldLabel}>
                    LinkedIn
                  </Text>
                </View>
                {editMode ? (
                  <TextInput
                    value={profile.linkedIn}
                    onChangeText={(text) => setProfile({ ...profile, linkedIn: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    keyboardType="url"
                  />
                ) : (
                  <Text variant="bodyLarge" style={[styles.fieldValue, styles.linkText]}>
                    {profile.linkedIn}
                  </Text>
                )}
              </View>

              <View style={[styles.formField, styles.fullWidth]}>
                <View style={styles.socialFieldHeader}>
                  <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
                  <Text variant="labelMedium" style={styles.fieldLabel}>
                    Twitter
                  </Text>
                </View>
                {editMode ? (
                  <TextInput
                    value={profile.twitter}
                    onChangeText={(text) => setProfile({ ...profile, twitter: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    keyboardType="url"
                  />
                ) : (
                  <Text variant="bodyLarge" style={[styles.fieldValue, styles.linkText]}>
                    {profile.twitter}
                  </Text>
                )}
              </View>

              <View style={[styles.formField, styles.fullWidth]}>
                <View style={styles.socialFieldHeader}>
                  <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                  <Text variant="labelMedium" style={styles.fieldLabel}>
                    Facebook
                  </Text>
                </View>
                {editMode ? (
                  <TextInput
                    value={profile.facebook}
                    onChangeText={(text) => setProfile({ ...profile, facebook: text })}
                    mode="outlined"
                    style={styles.input}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    keyboardType="url"
                  />
                ) : (
                  <Text variant="bodyLarge" style={[styles.fieldValue, styles.linkText]}>
                    {profile.facebook}
                  </Text>
                )}
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>

      {/* Account Settings */}
      <ScaleUp delay={200}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="settings" size={24} color={colors.accent} />
                <Text variant="titleLarge" style={styles.cardTitle}>
                  Account Settings
                </Text>
              </View>
            </View>

            <View style={styles.settingsOptions}>
              <Pressable
                style={styles.settingOption}
                onPress={() => navigation.navigate('ChangePassword')}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="lock-closed" size={20} color={colors.text} />
                  <Text variant="bodyLarge" style={styles.settingText}>
                    Change Password
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>

              <Pressable
                style={styles.settingOption}
                onPress={() => navigation.navigate('NotificationPreferences')}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications" size={20} color={colors.text} />
                  <Text variant="bodyLarge" style={styles.settingText}>
                    Notification Preferences
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>

              <Pressable
                style={styles.settingOption}
                onPress={() => navigation.navigate('PrivacySettings')}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.text} />
                  <Text variant="bodyLarge" style={styles.settingText}>
                    Privacy Settings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          </Card.Content>
        </Card>
      </ScaleUp>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  heroContent: {
    gap: spacing.lg,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  logoPressable: {
    // Empty base style, dynamic styles applied inline
  },
  logoContainer: {
    position: 'relative',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.lg,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  uploadBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  companyInfo: {
    flex: 1,
    gap: spacing.sm,
  },
  companyName: {
    color: colors.text,
    fontWeight: '700',
  },
  companyMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: colors.background,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  cardHeader: {
    marginBottom: spacing.lg,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  formGrid: {
    gap: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  formField: {
    flex: 1,
    minWidth: isTablet ? '45%' : '100%',
    gap: spacing.xs,
  },
  fullWidth: {
    minWidth: '100%',
  },
  fieldLabel: {
    color: colors.text,
    fontWeight: '600',
  },
  fieldValue: {
    color: colors.text,
    paddingTop: spacing.xs,
  },
  linkText: {
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.background,
  },
  textArea: {
    minHeight: 100,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  selectChip: {
    backgroundColor: colors.background,
  },
  selectChipActive: {
    backgroundColor: colors.primary,
  },
  selectChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  socialFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingsOptions: {
    gap: spacing.sm,
  },
  settingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingText: {
    color: colors.text,
    fontWeight: '500',
  },
});

export default EmployerProfileScreen;
