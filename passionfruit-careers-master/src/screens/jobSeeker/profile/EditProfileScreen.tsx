import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Platform } from 'react-native';
import { Text, ActivityIndicator, Surface, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchProfile } from '@/store/slices/profileSlice';
import PersonalInfoForm from './PersonalInfoForm';
import { PhotoUploadWidget } from '@/components/common';
import SkillsForm from './SkillsForm';
import ExperienceForm from './ExperienceForm';
import EducationForm from './EducationForm';
import { colors, spacing, borderRadius } from '@/theme';

type TabValue = 'personal' | 'skills' | 'experience' | 'education';

interface Tab {
  value: TabValue;
  label: string;
  icon: string;
  description: string;
}

const TABS: Tab[] = [
  {
    value: 'personal',
    label: 'Personal Info',
    icon: 'person-outline',
    description: 'Basic information and contact details',
  },
  {
    value: 'skills',
    label: 'Skills',
    icon: 'bulb-outline',
    description: 'Your professional skills and expertise',
  },
  {
    value: 'experience',
    label: 'Experience',
    icon: 'briefcase-outline',
    description: 'Work history and achievements',
  },
  {
    value: 'education',
    label: 'Education',
    icon: 'school-outline',
    description: 'Academic background and certifications',
  },
];

/**
 * Modern EditProfileScreen with improved UI/UX
 *
 * Features:
 * - Clean tab navigation with icons
 * - Gradient header
 * - Better spacing and typography
 * - Visual feedback for active states
 * - Responsive design
 */
const EditProfileScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('personal');
  const dispatch = useAppDispatch();
  const { data: profile, loading } = useAppSelector((state) => state.profile);
  const auth = useAppSelector((state) => state.auth);

  // Fetch profile on mount only
  React.useEffect(() => {
    console.log('[EditProfileScreen] Component mounted, fetching profile...');
    dispatch(fetchProfile());
  }, [dispatch]);

  const handlePhotoUploadSuccess = (photoUrl: string) => {
    console.log('[EditProfileScreen] Photo uploaded successfully:', photoUrl);
    dispatch(fetchProfile());
  };

  const handlePhotoUploadError = (error: Error) => {
    console.error('[EditProfileScreen] Photo upload error:', error);
  };

  const handlePhotoDeleteSuccess = () => {
    console.log('[EditProfileScreen] Photo deleted successfully');
    dispatch(fetchProfile());
  };

  // Loading state
  if (loading || !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  const activeTabData = TABS.find((tab) => tab.value === activeTab);
  const completionPercentage = profile.profile.completion || 0;

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Text style={styles.headerSubtitle}>Keep your information up to date</Text>

          {/* Profile Completion Badge */}
          <View style={styles.completionBadge}>
            <View style={styles.completionIconContainer}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
            <View style={styles.completionTextContainer}>
              <Text style={styles.completionLabel}>Profile Completion</Text>
              <Text style={styles.completionValue}>{completionPercentage}%</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Modern Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScrollView}
        contentContainerStyle={styles.tabsContainer}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          return (
            <Pressable
              key={tab.value}
              onPress={() => setActiveTab(tab.value)}
              style={[
                styles.tab,
                isActive && styles.tabActive,
              ]}
            >
              <View style={[
                styles.tabIconContainer,
                isActive && styles.tabIconContainerActive,
              ]}>
                <Ionicons
                  name={tab.icon as any}
                  size={22}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.tabIndicator} />}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Tab Description */}
      {activeTabData && (
        <View style={styles.tabDescription}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.tabDescriptionText}>{activeTabData.description}</Text>
        </View>
      )}

      {/* Content Area */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'personal' && (
          <View style={styles.section}>
            <PhotoUploadWidget
              currentPhotoUrl={profile.profile.profilePhotoUrl}
              userName={profile.user.fullName}
              userType="job_seeker"
              token={auth.token || ''}
              onUploadSuccess={handlePhotoUploadSuccess}
              onUploadError={handlePhotoUploadError}
              onDeleteSuccess={handlePhotoDeleteSuccess}
            />
            <PersonalInfoForm profile={profile} />
          </View>
        )}

        {activeTab === 'skills' && (
          <View style={styles.section}>
            <SkillsForm profile={profile} />
          </View>
        )}

        {activeTab === 'experience' && (
          <View style={styles.section}>
            <ExperienceForm profile={profile} />
          </View>
        )}

        {activeTab === 'education' && (
          <View style={styles.section}>
            <EducationForm profile={profile} />
          </View>
        )}

        {/* Bottom spacing for better scrolling */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Header styles
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.text,
    opacity: 0.8,
    marginBottom: spacing.md,
  },

  // Completion Badge
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginTop: spacing.sm,
  },
  completionIconContainer: {
    marginRight: spacing.sm,
  },
  completionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  completionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  completionValue: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },

  // Tab Navigation
  tabsScrollView: {
    flexGrow: 0,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 100,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: colors.primaryLight,
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(var(--primary-rgb), 0.15)',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.md,
    right: spacing.md,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },

  // Tab Description
  tabDescription: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabDescriptionText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

  // Content Area
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  section: {
    marginBottom: spacing.md,
  },
  bottomSpacing: {
    height: spacing.xxl * 2,
  },
});

export default EditProfileScreen;
