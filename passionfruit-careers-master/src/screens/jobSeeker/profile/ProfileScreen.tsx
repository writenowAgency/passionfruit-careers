import React, { useEffect } from 'react';
import { ScrollView, View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Text, Avatar, Chip, Divider, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { fetchProfile } from '@/store/slices/profileSlice';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { ProfileImage } from '@/components/common';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { data: profile, loading, error } = useAppSelector((state) => state.profile);
  const auth = useAppSelector((state) => state.auth);

  // Initial fetch on mount
  useEffect(() => {
    if (auth.token && !profile) {
      dispatch(fetchProfile());
    }
  }, [auth.token, dispatch]);

  // Refresh profile when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (auth.token) {
        console.log('[ProfileScreen] Screen focused, refreshing profile...');
        dispatch(fetchProfile());
      }
    }, [auth.token, dispatch])
  );

  const handleLogout = () => {
    dispatch(logout());
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => dispatch(fetchProfile())}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="person-circle-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No profile data available</Text>
        <Pressable style={styles.retryButton} onPress={() => dispatch(fetchProfile())}>
          <Text style={styles.retryButtonText}>Load Profile</Text>
        </Pressable>
      </View>
    );
  }

  const completionPercentage = profile.profile.completion || 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Header Section */}
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <ProfileImage
            imageUrl={profile.profile.profilePhotoUrl}
            userName={profile.user.fullName}
            size="large"
            shape="circle"
            style={styles.avatar}
          />
          <Text style={styles.userName}>{profile.user.fullName}</Text>
          {profile.profile.headline && (
            <Text style={styles.userHeadline}>{profile.profile.headline}</Text>
          )}
          <View style={styles.userMeta}>
            {profile.profile.location && (
              <View style={styles.metaItem}>
                <Ionicons name="location" size={16} color={colors.text} />
                <Text style={styles.metaText}>{profile.profile.location}</Text>
              </View>
            )}
            {profile.user.email && (
              <View style={styles.metaItem}>
                <Ionicons name="mail" size={16} color={colors.text} />
                <Text style={styles.metaText}>{profile.user.email}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditProfile' as never)}
        >
          <Ionicons name="create-outline" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Edit Profile</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => navigation.navigate('ProfileStrengthMeter' as never)}
        >
          <Ionicons name="analytics-outline" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Improve</Text>
        </Pressable>
        <Pressable
          style={styles.actionButton}
          onPress={() => navigation.navigate('DocumentsManager' as never)}
        >
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={styles.actionButtonText}>Documents</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Profile Strength Card */}
        <Surface style={styles.card} elevation={1}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="speedometer-outline" size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Profile Strength</Text>
            </View>
          </View>
          <View style={styles.strengthContainer}>
            <View style={styles.strengthCircle}>
              <Text style={styles.strengthPercentage}>{completionPercentage}%</Text>
              <Text style={styles.strengthLabel}>Complete</Text>
            </View>
            <View style={styles.strengthInfo}>
              <Text style={styles.strengthText}>
                {completionPercentage < 40
                  ? 'Get started by adding your experience and skills'
                  : completionPercentage < 70
                  ? 'You\'re making progress! Keep adding more details'
                  : completionPercentage < 100
                  ? 'Almost there! Complete your profile to stand out'
                  : 'Your profile is complete! Keep it updated'}
              </Text>
            </View>
          </View>
        </Surface>

        {/* About Section */}
        {profile.profile.bio && (
          <Surface style={styles.card} elevation={1}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="information-circle-outline" size={24} color={colors.primary} />
                <Text style={styles.cardTitle}>About</Text>
              </View>
              <Pressable onPress={() => navigation.navigate('EditProfile' as never)}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </Pressable>
            </View>
            <Text style={styles.bioText}>{profile.profile.bio}</Text>
          </Surface>
        )}

        {/* Skills Section */}
        <Surface style={styles.card} elevation={1}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="bulb-outline" size={24} color={colors.primary} />
              <View>
                <Text style={styles.cardTitle}>Skills</Text>
                <Text style={styles.cardSubtitle}>{profile.skills.length} skills</Text>
              </View>
            </View>
            <Pressable
              style={styles.manageButton}
              onPress={() => navigation.navigate('SkillsManager' as never)}
            >
              <Text style={styles.manageButtonText}>Manage</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
          {profile.skills.length > 0 ? (
            <View style={styles.chipsContainer}>
              {profile.skills.slice(0, 8).map((skill) => (
                <Chip
                  key={skill.id}
                  style={styles.chip}
                  textStyle={styles.chipText}
                  icon={() => <Ionicons name="checkmark-circle" size={16} color={colors.success} />}
                >
                  {skill.name}
                </Chip>
              ))}
              {profile.skills.length > 8 && (
                <Chip style={styles.moreChip}>
                  <Text style={styles.moreChipText}>+{profile.skills.length - 8} more</Text>
                </Chip>
              )}
            </View>
          ) : (
            <EmptyState
              icon="bulb-outline"
              title="No skills added yet"
              subtitle="Add your skills to help employers find you"
              actionText="Add Skills"
              onAction={() => navigation.navigate('SkillsManager' as never)}
            />
          )}
        </Surface>

        {/* Experience Section */}
        <Surface style={styles.card} elevation={1}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="briefcase-outline" size={24} color={colors.primary} />
              <View>
                <Text style={styles.cardTitle}>Experience</Text>
                <Text style={styles.cardSubtitle}>{profile.experience.length} positions</Text>
              </View>
            </View>
            <Pressable
              style={styles.manageButton}
              onPress={() => navigation.navigate('ExperienceManager' as never)}
            >
              <Text style={styles.manageButtonText}>Manage</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
          {profile.experience.length > 0 ? (
            <View style={styles.listContainer}>
              {profile.experience.slice(0, 3).map((exp, index) => (
                <View key={exp.id}>
                  <View style={styles.listItem}>
                    <View style={styles.listItemIcon}>
                      <Ionicons name="business" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{exp.jobTitle}</Text>
                      <Text style={styles.listItemSubtitle}>{exp.companyName}</Text>
                      <Text style={styles.listItemMeta}>
                        {new Date(exp.startDate).getFullYear()} - {exp.isCurrent ? 'Present' : new Date(exp.endDate!).getFullYear()}
                      </Text>
                    </View>
                  </View>
                  {index < profile.experience.slice(0, 3).length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
              {profile.experience.length > 3 && (
                <Pressable
                  style={styles.viewAllButton}
                  onPress={() => navigation.navigate('ExperienceManager' as never)}
                >
                  <Text style={styles.viewAllText}>View all {profile.experience.length} positions</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                </Pressable>
              )}
            </View>
          ) : (
            <EmptyState
              icon="briefcase-outline"
              title="No experience added yet"
              subtitle="Showcase your work history to employers"
              actionText="Add Experience"
              onAction={() => navigation.navigate('ExperienceManager' as never)}
            />
          )}
        </Surface>

        {/* Education Section */}
        <Surface style={styles.card} elevation={1}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Ionicons name="school-outline" size={24} color={colors.primary} />
              <View>
                <Text style={styles.cardTitle}>Education</Text>
                <Text style={styles.cardSubtitle}>{profile.education.length} qualifications</Text>
              </View>
            </View>
            <Pressable
              style={styles.manageButton}
              onPress={() => navigation.navigate('EducationManager' as never)}
            >
              <Text style={styles.manageButtonText}>Manage</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
          {profile.education.length > 0 ? (
            <View style={styles.listContainer}>
              {profile.education.slice(0, 3).map((edu, index) => (
                <View key={edu.id}>
                  <View style={styles.listItem}>
                    <View style={styles.listItemIcon}>
                      <Ionicons name="ribbon" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{edu.degree}</Text>
                      <Text style={styles.listItemSubtitle}>{edu.institutionName}</Text>
                      {edu.fieldOfStudy && (
                        <Text style={styles.listItemMeta}>{edu.fieldOfStudy}</Text>
                      )}
                    </View>
                  </View>
                  {index < profile.education.slice(0, 3).length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="school-outline"
              title="No education added yet"
              subtitle="Add your educational background"
              actionText="Add Education"
              onAction={() => navigation.navigate('EducationManager' as never)}
            />
          )}
        </Surface>

        {/* Certifications Section */}
        {(profile.certifications && profile.certifications.length > 0) && (
          <Surface style={styles.card} elevation={1}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="medal-outline" size={24} color={colors.primary} />
                <View>
                  <Text style={styles.cardTitle}>Certifications</Text>
                  <Text style={styles.cardSubtitle}>{profile.certifications.length} certifications</Text>
                </View>
              </View>
              <Pressable
                style={styles.manageButton}
                onPress={() => navigation.navigate('CertificationsManager' as never)}
              >
                <Text style={styles.manageButtonText}>Manage</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </Pressable>
            </View>
            <View style={styles.listContainer}>
              {profile.certifications.slice(0, 3).map((cert, index) => (
                <View key={cert.id}>
                  <View style={styles.listItem}>
                    <View style={styles.listItemIcon}>
                      <Ionicons name="trophy" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>{cert.certificationName}</Text>
                      <Text style={styles.listItemSubtitle}>{cert.issuingOrganization}</Text>
                      <Text style={styles.listItemMeta}>
                        Issued: {new Date(cert.issueDate).getFullYear()}
                        {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).getFullYear()}`}
                      </Text>
                    </View>
                  </View>
                  {index < profile.certifications.slice(0, 3).length - 1 && <Divider style={styles.divider} />}
                </View>
              ))}
            </View>
          </Surface>
        )}

        {/* Languages Section */}
        {(profile.languages && profile.languages.length > 0) && (
          <Surface style={styles.card} elevation={1}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="language-outline" size={24} color={colors.primary} />
                <View>
                  <Text style={styles.cardTitle}>Languages</Text>
                  <Text style={styles.cardSubtitle}>{profile.languages.length} languages</Text>
                </View>
              </View>
              <Pressable
                style={styles.manageButton}
                onPress={() => navigation.navigate('LanguagesManager' as never)}
              >
                <Text style={styles.manageButtonText}>Manage</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </Pressable>
            </View>
            <View style={styles.chipsContainer}>
              {profile.languages.map((lang) => (
                <Chip
                  key={lang.id}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {lang.languageName} • {lang.proficiencyLevel}
                </Chip>
              ))}
            </View>
          </Surface>
        )}

        {/* Career Objectives Section */}
        {profile.profile.careerObjectives && (
          <Surface style={styles.card} elevation={1}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="flag-outline" size={24} color={colors.primary} />
                <Text style={styles.cardTitle}>Career Objectives</Text>
              </View>
              <Pressable onPress={() => navigation.navigate('CareerObjectivesEditor' as never)}>
                <Ionicons name="create-outline" size={20} color={colors.primary} />
              </Pressable>
            </View>
            <Text style={styles.bioText}>{profile.profile.careerObjectives}</Text>
          </Surface>
        )}

        {/* Job Preferences Section */}
        {(profile.preferredJobCategories && profile.preferredJobCategories.length > 0) && (
          <Surface style={styles.card} elevation={1}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="settings-outline" size={24} color={colors.primary} />
                <Text style={styles.cardTitle}>Job Preferences</Text>
              </View>
              <Pressable
                style={styles.manageButton}
                onPress={() => navigation.navigate('PreferencesManager' as never)}
              >
                <Text style={styles.manageButtonText}>Manage</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </Pressable>
            </View>
            <View style={styles.preferencesContainer}>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceLabel}>Work Type</Text>
                <Text style={styles.preferenceValue}>{profile.profile.preferredWorkType || 'Not set'}</Text>
              </View>
              {profile.profile.desiredSalaryMin && profile.profile.desiredSalaryMax && (
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Salary Range</Text>
                  <Text style={styles.preferenceValue}>
                    {profile.profile.salaryCurrency} {profile.profile.desiredSalaryMin.toLocaleString()} - {profile.profile.desiredSalaryMax.toLocaleString()}
                  </Text>
                </View>
              )}
              {profile.profile.availabilityStartDate && (
                <View style={styles.preferenceItem}>
                  <Text style={styles.preferenceLabel}>Available From</Text>
                  <Text style={styles.preferenceValue}>
                    {new Date(profile.profile.availabilityStartDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.chipsContainer}>
              {profile.preferredJobCategories.slice(0, 5).map((cat) => (
                <Chip
                  key={cat.id}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {cat.categoryName}
                </Chip>
              ))}
              {profile.preferredJobCategories.length > 5 && (
                <Chip style={styles.moreChip}>
                  <Text style={styles.moreChipText}>+{profile.preferredJobCategories.length - 5} more</Text>
                </Chip>
              )}
            </View>
          </Surface>
        )}

        {/* Logout Section */}
        <Surface style={[styles.card, styles.logoutCard]} elevation={1}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </Surface>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
};

// Empty State Component
const EmptyState: React.FC<{
  icon: string;
  title: string;
  subtitle: string;
  actionText: string;
  onAction: () => void;
}> = ({ icon, title, subtitle, actionText, onAction }) => (
  <View style={styles.emptyState}>
    <Ionicons name={icon as any} size={48} color={colors.textSecondary} />
    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>
    <Pressable style={styles.emptyStateButton} onPress={onAction}>
      <Text style={styles.emptyStateButtonText}>{actionText}</Text>
      <Ionicons name="add-circle" size={20} color={colors.primary} />
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
  },
  retryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  headerGradient: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  avatar: {
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  avatarLabel: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  userHeadline: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  userMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginTop: -spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    minWidth: 100,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: 20,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  strengthCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primary,
  },
  strengthPercentage: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  strengthLabel: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  strengthInfo: {
    flex: 1,
  },
  strengthText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  bioText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  moreChip: {
    backgroundColor: colors.background,
  },
  moreChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  listContainer: {
    gap: spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
    gap: 2,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.8,
  },
  listItemMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    marginVertical: spacing.sm,
    backgroundColor: colors.divider,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  preferencesContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  logoutCard: {
    padding: 0,
    overflow: 'hidden',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  bottomSpacing: {
    height: spacing.xxl,
  },
});

export default ProfileScreen;
