import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Surface, ProgressBar as PaperProgressBar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileSection {
  id: string;
  title: string;
  description: string;
  isComplete: boolean;
  icon: string;
  route?: string;
  weight: number; // Contribution to overall completion
}

const ProfileStrengthMeter: React.FC = () => {
  const navigation = useNavigation();
  const profile = useAppSelector((state) => state.profile.data);

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completion = profile.profile.completion || 0;

  // Calculate section completions
  const sections: ProfileSection[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Add your phone, bio, and location',
      isComplete: !!(profile.profile.phone && profile.profile.bio && profile.profile.location),
      icon: 'person',
      route: 'EditProfile',
      weight: 20,
    },
    {
      id: 'photo',
      title: 'Profile Photo',
      description: 'Upload a professional photo',
      isComplete: !!profile.profile.profilePhotoUrl,
      icon: 'camera',
      route: 'EditProfile',
      weight: 10,
    },
    {
      id: 'skills',
      title: 'Skills',
      description: 'Add at least 1 skill',
      isComplete: Array.isArray(profile.skills) && profile.skills.length > 0,
      icon: 'bulb',
      route: 'SkillsManager',
      weight: 20,
    },
    {
      id: 'experience',
      title: 'Work Experience',
      description: 'Add your work history',
      isComplete: (profile.experience?.length || 0) > 0,
      icon: 'briefcase',
      route: 'ExperienceManager',
      weight: 20,
    },
    {
      id: 'education',
      title: 'Education',
      description: 'Add your educational background',
      isComplete: (profile.education?.length || 0) > 0,
      icon: 'school',
      route: 'EducationManager',
      weight: 15,
    },
    {
      id: 'resume',
      title: 'Resume/CV',
      description: 'Upload your resume',
      isComplete: !!profile.profile.resumeUrl || (profile.documents?.some(doc => doc.documentType === 'cv') || false),
      icon: 'document-text',
      route: 'DocumentsManager',
      weight: 10,
    },
    {
      id: 'objectives',
      title: 'Career Objectives',
      description: 'Define your career goals',
      isComplete: !!profile.profile.careerObjectives,
      icon: 'flag',
      route: 'CareerObjectivesEditor',
      weight: 5,
    },
  ];

  const completedSections = sections.filter((s) => s.isComplete).length;
  const totalSections = sections.length;

  const getCompletionColor = () => {
    if (completion >= 80) return colors.success;
    if (completion >= 50) return colors.warning;
    return colors.error;
  };

  const getCompletionMessage = () => {
    if (completion >= 90) return 'Excellent! Your profile is very strong';
    if (completion >= 70) return 'Great progress! Almost there';
    if (completion >= 50) return 'Good start! Keep going';
    return 'Let\'s build your profile';
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Completion Header */}
        <Surface style={styles.headerCard} elevation={2}>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreText, { color: getCompletionColor() }]}>
              {completion}%
            </Text>
            <Text style={styles.scoreLabel}>Complete</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Profile Strength</Text>
            <Text style={styles.headerSubtitle}>{getCompletionMessage()}</Text>
            <View style={styles.progressContainer}>
              <PaperProgressBar
                progress={completion / 100}
                color={getCompletionColor()}
                style={styles.progressBar}
              />
            </View>
            <Text style={styles.sectionCount}>
              {completedSections} of {totalSections} sections complete
            </Text>
          </View>
        </Surface>

        {/* Sections List */}
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionHeader}>Complete Your Profile</Text>
          {sections.map((section) => (
            <Pressable
              key={section.id}
              style={styles.sectionCard}
              onPress={() => section.route && navigation.navigate(section.route as never)}
              disabled={!section.route}
            >
              <View style={styles.sectionContent}>
                <View
                  style={[
                    styles.iconContainer,
                    section.isComplete
                      ? styles.iconContainerComplete
                      : styles.iconContainerIncomplete,
                  ]}
                >
                  <Ionicons
                    name={section.isComplete ? 'checkmark' : (section.icon as any)}
                    size={24}
                    color={section.isComplete ? colors.success : colors.textSecondary}
                  />
                </View>
                <View style={styles.sectionTextContainer}>
                  <View style={styles.sectionTitleRow}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    {section.isComplete && (
                      <View style={styles.completeBadge}>
                        <Text style={styles.completeBadgeText}>Complete</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.sectionDescription}>{section.description}</Text>
                </View>
                {!section.isComplete && section.route && (
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                )}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Tips Section */}
        <Surface style={styles.tipsCard} elevation={1}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color={colors.warning} />
            <Text style={styles.tipsTitle}>Tips for a Strong Profile</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>
                Use a professional photo to increase trust
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>
                Add specific skills that match job requirements
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>
                Include measurable achievements in your experience
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.tipText}>
                Keep your resume updated and relevant
              </Text>
            </View>
          </View>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    ...shadows.md,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceVariant,
  },
  sectionCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionsContainer: {
    gap: spacing.md,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.sm,
  },
  sectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerComplete: {
    backgroundColor: `${colors.success}15`,
  },
  iconContainerIncomplete: {
    backgroundColor: colors.surfaceVariant,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  completeBadge: {
    backgroundColor: `${colors.success}15`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  completeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  tipsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default ProfileStrengthMeter;
