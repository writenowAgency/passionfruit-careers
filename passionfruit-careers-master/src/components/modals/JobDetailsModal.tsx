import { View, ScrollView, StyleSheet, Modal, Pressable, Linking, ColorValue } from 'react-native';
import { Text, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import type { Job } from '@/types';
import { MatchScoreBadge } from '../common/MatchScoreBadge';
import { useAppSelector } from '@/store/hooks';

interface Props {
  visible: boolean;
  job: Job | null;
  onClose: () => void;
  onApply: () => void;
  onSave: () => void;
  isApplying?: boolean;
  hasApplied?: boolean;
  isSaved?: boolean;
}

const DetailSection = ({ icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={24} color={colors.primary} />
      <Text variant="titleLarge" style={styles.sectionTitle}>
        {title}
      </Text>
    </View>
    {children}
  </View>
);

const parseDescription = (description: string) => {
  const sections: { [key: string]: string[] } = {
    responsibilities: [],
    qualifications: [],
    benefits: [],
    about: [],
  };

  let currentSection = 'about';

  const lines = description.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.toLowerCase().startsWith('## responsibilities')) {
      currentSection = 'responsibilities';
      continue;
    } else if (trimmedLine.toLowerCase().startsWith('## qualifications')) {
      currentSection = 'qualifications';
      continue;
    } else if (trimmedLine.toLowerCase().startsWith('## benefits')) {
      currentSection = 'benefits';
      continue;
    }

    if (trimmedLine) {
        sections[currentSection].push(trimmedLine.replace(/^- /g, ''));
    }
  }

  // If no sections were parsed, put the whole description in 'about'
  if (sections.responsibilities.length === 0 && sections.qualifications.length === 0 && sections.benefits.length === 0) {
      sections.about = description.split('\n').filter(l => l.trim());
  }

  return sections;
};

export const JobDetailsModal: React.FC<Props> = ({
  visible,
  job,
  onClose,
  onApply,
  onSave,
  isApplying = false,
  hasApplied = false,
  isSaved = false,
}) => {
  if (!job) return null;

  const parsedSections = parseDescription(job.description || '');

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return 'Competitive salary';
    const symbol = (job.salaryCurrency || 'ZAR') === 'ZAR' ? 'R' : job.salaryCurrency;

    const formatValue = (value: string) => {
      const num = parseInt(value);
      if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
      }
      return `${(num / 1000).toFixed(0)}k`;
    };

    if (job.salaryMin && job.salaryMax) {
      return `${symbol}${formatValue(job.salaryMin)} - ${symbol}${formatValue(job.salaryMax)} per year`;
    }
    if (job.salaryMin) return `From ${symbol}${formatValue(job.salaryMin)} per year`;
    if (job.salaryMax) return `Up to ${symbol}${formatValue(job.salaryMax)} per year`;
    return 'Competitive salary';
  };

  const formatDate = () => {
    const date = new Date(job.createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Posted today';
    if (diffInDays === 1) return 'Posted yesterday';
    if (diffInDays < 7) return `Posted ${diffInDays} days ago`;
    if (diffInDays < 30) return `Posted ${Math.floor(diffInDays / 7)} weeks ago`;
    return `Posted ${Math.floor(diffInDays / 30)} months ago`;
  };

  const requirements = job.requirements ? job.requirements.split(',').map(r => r.trim()).filter(r => r) : [];
  const matchScore = job.matchScore || Math.floor(Math.random() * 20) + 75;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </Pressable>
          <Text variant="titleMedium" style={styles.headerTitle}>
            Job Details
          </Text>
          <Pressable onPress={onSave} style={styles.saveButton}>
            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={24} color={isSaved ? colors.primary : colors.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Company Logo & Title */}
          <View style={styles.companySection}>
            <View style={styles.logoContainer}>
              {job.companyLogo ? (
                <Image
                  source={{ uri: job.companyLogo }}
                  style={styles.companyLogo}
                  cachePolicy="memory-disk"
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.companyLogo, styles.placeholderLogo]}>
                  <Text style={styles.placeholderText}>{job.company.charAt(0)}</Text>
                </View>
              )}
            </View>

            <View style={styles.titleSection}>
              <Text variant="headlineMedium" style={styles.jobTitle}>
                {job.title}
              </Text>
              <Text variant="titleMedium" style={styles.companyName}>
                {job.company}
              </Text>
              <View style={styles.metaRow}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text variant="bodyMedium" style={styles.metaText}>
                  {job.location || 'Remote'}
                </Text>
                <Text style={styles.bullet}>•</Text>
                <Text variant="bodyMedium" style={styles.metaText}>
                  {formatDate()}
                </Text>
              </View>
            </View>

            <MatchScoreBadge score={matchScore} size="medium" />
          </View>

          {/* Quick Info Chips */}
          <View style={styles.chipsContainer}>
            {job.jobType && (
              <Chip icon={() => <Ionicons name="briefcase" size={14} color={colors.text} />} style={styles.chip}>
                {job.jobType}
              </Chip>
            )}
            {job.experienceLevel && (
              <Chip icon={() => <Ionicons name="school" size={14} color={colors.text} />} style={styles.chip}>
                {job.experienceLevel}
              </Chip>
            )}
            <Chip icon={() => <Ionicons name="people" size={14} color={colors.text} />} style={styles.chip}>
              {job.applicationsCount || 0} applicants
            </Chip>
          </View>

          {/* Salary */}
          <DetailSection icon="cash-outline" title="Salary">
            <Text variant="bodyLarge" style={styles.salaryText}>
              {formatSalary()}
            </Text>
          </DetailSection>

          <Divider style={styles.divider} />

          {/* Job Description Sections */}
          {parsedSections.about.length > 0 && (
              <>
                  <DetailSection icon="document-text-outline" title="About the job">
                      {parsedSections.about.map((paragraph, index) => (
                          <Text key={index} variant="bodyLarge" style={styles.descriptionText}>
                              {paragraph}
                          </Text>
                      ))}
                  </DetailSection>
                  <Divider style={styles.divider} />
              </>
          )}

          {parsedSections.responsibilities.length > 0 && (
              <>
                  <DetailSection icon="list-outline" title="Responsibilities">
                      <View style={styles.requirementsList}>
                          {parsedSections.responsibilities.map((item, index) => (
                              <View key={index} style={styles.requirementItem}>
                                  <Ionicons name="caret-forward" size={16} color={colors.textSecondary} style={{marginTop: 4}} />
                                  <Text variant="bodyLarge" style={styles.requirementText}>
                                      {item}
                                  </Text>
                              </View>
                          ))}
                      </View>
                  </DetailSection>
                  <Divider style={styles.divider} />
              </>
          )}

          {parsedSections.qualifications.length > 0 && (
              <>
                  <DetailSection icon="school-outline" title="Qualifications">
                      <View style={styles.requirementsList}>
                          {parsedSections.qualifications.map((item, index) => (
                              <View key={index} style={styles.requirementItem}>
                                  <Ionicons name="caret-forward" size={16} color={colors.textSecondary} style={{marginTop: 4}} />
                                  <Text variant="bodyLarge" style={styles.requirementText}>
                                      {item}
                                  </Text>
                              </View>
                          ))}
                      </View>
                  </DetailSection>
                  <Divider style={styles.divider} />
              </>
          )}
          
          {/* Requirements */}
          {requirements.length > 0 && (
            <>
              <DetailSection icon="checkmark-circle-outline" title="Requirements">
                <View style={styles.requirementsList}>
                  {requirements.map((tag, index) => (
                    <View key={index} style={styles.requirementItem}>
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                      <Text variant="bodyLarge" style={styles.requirementText}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </DetailSection>
              <Divider style={styles.divider} />
            </>
          )}

          {parsedSections.benefits.length > 0 && (
              <>
                  <DetailSection icon="gift-outline" title="Benefits">
                      <View style={styles.requirementsList}>
                          {parsedSections.benefits.map((item, index) => (
                              <View key={index} style={styles.requirementItem}>
                                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                                  <Text variant="bodyLarge" style={styles.requirementText}>
                                      {item}
                                  </Text>
                              </View>
                          ))}
                      </View>
                  </DetailSection>
                  <Divider style={styles.divider} />
              </>
          )}

          {/* Company Information */}
          <DetailSection icon="business-outline" title={`About ${job.company}`}>
            {job.companyDescription && (
              <Text variant="bodyLarge" style={styles.companyDescription}>
                {job.companyDescription}
              </Text>
            )}

            {job.companyWebsite && (
              <Pressable
                style={styles.websiteButton}
                onPress={() => Linking.openURL(job.companyWebsite!)}
              >
                <Ionicons name="globe-outline" size={20} color={colors.primary} />
                <Text variant="bodyLarge" style={styles.websiteText}>
                  Visit company website
                </Text>
                <Ionicons name="open-outline" size={16} color={colors.primary} />
              </Pressable>
            )}
          </DetailSection>

          {/* Spacer for fixed footer */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Fixed Footer with Apply Button */}
        <View style={styles.footer}>
          {hasApplied ? (
            <View style={styles.appliedContainer}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text variant="titleMedium" style={styles.appliedText}>
                Applied to this job
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={onApply}
              disabled={isApplying}
              style={[styles.applyButtonContainer, isApplying && styles.applyingButton]}
            >
              <LinearGradient
                colors={isApplying ? [colors.surfaceVariant, colors.surfaceVariant] : colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.applyButton}
              >
                <Text variant="titleMedium" style={styles.applyButtonText}>
                  {isApplying ? 'Applying...' : 'Apply now'}
                </Text>
                {isApplying ? (
                  <Text style={{ fontSize: 24 }}>⏳</Text>
                ) : (
                  <Ionicons name="arrow-forward" size={24} color={colors.text} />
                )}
              </LinearGradient>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surface,
  },
  closeButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
  },
  companySection: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
    overflow: 'hidden',
  },
  companyLogo: {
    width: '100%',
    height: '100%',
  },
  placeholderLogo: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
  },
  titleSection: {
    flex: 1,
  },
  jobTitle: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  companyName: {
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.textSecondary,
  },
  bullet: {
    color: colors.textSecondary,
    marginHorizontal: spacing.xs,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  chip: {
    backgroundColor: colors.background,
  },
  section: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    color: colors.text,
  },
  salaryText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 18,
  },
  descriptionText: {
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  requirementsList: {
    gap: spacing.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  requirementText: {
    flex: 1,
    color: colors.text,
    lineHeight: 24,
  },
  companyDescription: {
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  websiteText: {
    flex: 1,
    color: colors.primary,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: colors.divider,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.surface,
    ...shadows.lg,
  },
  appliedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.success,
  },
  appliedText: {
    color: colors.success,
    fontWeight: '700',
  },
  applyButtonContainer: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.md,
  },
  applyingButton: {
    opacity: 0.7,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  applyButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
  },
});
