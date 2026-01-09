import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Pressable, Alert } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, IconButton, Menu, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { employerApi, RecentApplicant } from '@/services/employerApi';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { EmployerApplicantsStackParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type PipelineStage = 'new' | 'reviewing' | 'interview' | 'offer' | 'hired' | 'rejected';

interface PipelineColumn {
  stage: PipelineStage;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  menuIcon: string; // Material Community Icons for Menu.Item
  color: string;
  backgroundColor: string;
}

const PIPELINE_STAGES: PipelineColumn[] = [
  {
    stage: 'new',
    title: 'New',
    icon: 'mail-unread',
    menuIcon: 'email-outline',
    color: colors.info,
    backgroundColor: `${colors.info}15`,
  },
  {
    stage: 'reviewing',
    title: 'Reviewing',
    icon: 'eye',
    menuIcon: 'eye-outline',
    color: colors.warning,
    backgroundColor: `${colors.warning}15`,
  },
  {
    stage: 'interview',
    title: 'Interview',
    icon: 'people',
    menuIcon: 'account-group',
    color: colors.secondary,
    backgroundColor: `${colors.secondary}15`,
  },
  {
    stage: 'offer',
    title: 'Offer',
    icon: 'document-text',
    menuIcon: 'file-document-outline',
    color: colors.accent,
    backgroundColor: `${colors.accent}15`,
  },
  {
    stage: 'hired',
    title: 'Hired',
    icon: 'checkmark-circle',
    menuIcon: 'check-circle-outline',
    color: colors.success,
    backgroundColor: `${colors.success}15`,
  },
  {
    stage: 'rejected',
    title: 'Rejected',
    icon: 'close-circle',
    menuIcon: 'close-circle-outline',
    color: colors.error,
    backgroundColor: `${colors.error}15`,
  },
];

type Navigation = NativeStackNavigationProp<EmployerApplicantsStackParamList, 'ApplicantPipeline'>;

const ApplicantPipelineScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>();
  const token = useAppSelector((state) => state.auth.token);

  const [applicants, setApplicants] = useState<RecentApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetchApplicants();
  }, [token]);

  const fetchApplicants = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await employerApi.getRecentApplicants(token, 100);
      setApplicants(data.applicants);
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
      Alert.alert('Error', 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const getApplicantsByStage = (stage: PipelineStage): RecentApplicant[] => {
    // Map application status to pipeline stages
    const statusMapping: { [key: string]: PipelineStage } = {
      'pending': 'new',
      'reviewed': 'reviewing',
      'shortlisted': 'interview',
      'interview': 'interview',
      'offered': 'offer',
      'accepted': 'hired',
      'rejected': 'rejected',
      'withdrawn': 'rejected',
    };

    return applicants.filter((app) => {
      const mappedStage = statusMapping[app.status.toLowerCase()] || 'new';
      return mappedStage === stage;
    });
  };

  const handleMoveToStage = async (applicantId: number, newStage: PipelineStage) => {
    if (!token) return;

    // Map pipeline stage back to application status
    const stageToStatusMapping: { [key in PipelineStage]: string } = {
      'new': 'pending',
      'reviewing': 'reviewed',
      'interview': 'shortlisted',
      'offer': 'offered',
      'hired': 'accepted',
      'rejected': 'rejected',
    };

    const newStatus = stageToStatusMapping[newStage];

    try {
      setUpdatingId(applicantId);
      await employerApi.updateApplicationStatus(token, applicantId, newStatus);

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicantId ? { ...app, status: newStatus } : app
        )
      );

      setMenuVisible((prev) => ({ ...prev, [applicantId]: false }));
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('Error', 'Failed to update applicant status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleViewProfile = (applicantId: number) => {
    navigation.navigate('ApplicantProfile', { applicantId });
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.accent;
  };

  const renderApplicantCard = (applicant: RecentApplicant) => (
    <Card key={applicant.id} style={styles.applicantCard}>
      <Pressable onPress={() => handleViewProfile(applicant.id)}>
        <Card.Content style={styles.applicantCardContent}>
          <View style={styles.applicantHeader}>
            <View style={styles.applicantInfo}>
              {applicant.photo ? (
                <Avatar.Image size={40} source={{ uri: applicant.photo }} />
              ) : (
                <Avatar.Text
                  size={40}
                  label={applicant.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                  style={{ backgroundColor: colors.primary }}
                />
              )}
              <View style={styles.applicantDetails}>
                <Text variant="titleSmall" style={styles.applicantName} numberOfLines={1}>
                  {applicant.name}
                </Text>
                <Text variant="bodySmall" style={styles.applicantRole} numberOfLines={1}>
                  {applicant.role}
                </Text>
              </View>
            </View>

            <Menu
              visible={menuVisible[applicant.id]}
              onDismiss={() => setMenuVisible((prev) => ({ ...prev, [applicant.id]: false }))}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible((prev) => ({ ...prev, [applicant.id]: true }))}
                  disabled={updatingId === applicant.id}
                />
              }
            >
              <Menu.Item
                onPress={() => handleViewProfile(applicant.id)}
                title="View Profile"
                leadingIcon="account"
              />
              {PIPELINE_STAGES.map((stage) => (
                <Menu.Item
                  key={stage.stage}
                  onPress={() => handleMoveToStage(applicant.id, stage.stage)}
                  title={`Move to ${stage.title}`}
                  leadingIcon={stage.menuIcon}
                />
              ))}
            </Menu>
          </View>

          {applicant.jobTitle && (
            <Text variant="bodySmall" style={styles.jobTitle} numberOfLines={1}>
              Applied for: {applicant.jobTitle}
            </Text>
          )}

          <View style={styles.applicantFooter}>
            <Chip
              compact
              style={[
                styles.matchChip,
                { backgroundColor: `${getMatchScoreColor(applicant.matchScore || 0)}20` },
              ]}
              textStyle={{ color: getMatchScoreColor(applicant.matchScore || 0), fontSize: 11 }}
            >
              {applicant.matchScore || 0}% Match
            </Chip>

            <Text variant="bodySmall" style={styles.appliedDate}>
              {new Date(applicant.appliedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </Card.Content>
      </Pressable>
    </Card>
  );

  const renderColumn = (column: PipelineColumn) => {
    const stageApplicants = getApplicantsByStage(column.stage);

    return (
      <View key={column.stage} style={styles.column}>
        <View style={[styles.columnHeader, { backgroundColor: column.backgroundColor }]}>
          <View style={styles.columnHeaderContent}>
            <Ionicons name={column.icon} size={20} color={column.color} />
            <Text variant="titleMedium" style={[styles.columnTitle, { color: column.color }]}>
              {column.title}
            </Text>
            <Chip compact style={[styles.countChip, { backgroundColor: column.color }]}>
              <Text style={styles.countText}>{stageApplicants.length}</Text>
            </Chip>
          </View>
        </View>

        <ScrollView
          style={styles.columnContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.columnScrollContent}
        >
          {stageApplicants.length > 0 ? (
            stageApplicants.map((applicant) => renderApplicantCard(applicant))
          ) : (
            <View style={styles.emptyColumn}>
              <Ionicons name="folder-open-outline" size={32} color={colors.textSecondary} />
              <Text variant="bodySmall" style={styles.emptyText}>
                No applicants
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading pipeline...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FadeIn delay={0}>
        <LinearGradient
          colors={['#FFF9E6', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text variant="headlineMedium" style={styles.headerTitle}>
                Applicant Pipeline
              </Text>
              <Text variant="bodyMedium" style={styles.headerSubtitle}>
                {applicants.length} total {applicants.length === 1 ? 'applicant' : 'applicants'}
              </Text>
            </View>
            <IconButton
              icon="refresh"
              size={24}
              iconColor={colors.primary}
              onPress={fetchApplicants}
            />
          </View>
        </LinearGradient>
      </FadeIn>

      <ScrollView
        horizontal
        style={styles.pipelineContainer}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pipelineContent}
      >
        {PIPELINE_STAGES.map((column) => renderColumn(column))}
      </ScrollView>
    </View>
  );
};

const COLUMN_WIDTH = isTablet ? 300 : 280;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  pipelineContainer: {
    flex: 1,
  },
  pipelineContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  column: {
    width: COLUMN_WIDTH,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    ...shadows.sm,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  columnHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  columnTitle: {
    fontWeight: '600',
  },
  countChip: {
    height: 24,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  columnContent: {
    flex: 1,
    maxHeight: 600,
  },
  columnScrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  applicantCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.background,
    ...shadows.xs,
  },
  applicantCardContent: {
    padding: spacing.md,
  },
  applicantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  applicantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  applicantDetails: {
    flex: 1,
  },
  applicantName: {
    color: colors.text,
    fontWeight: '600',
  },
  applicantRole: {
    color: colors.textSecondary,
    marginTop: 2,
  },
  jobTitle: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  applicantFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchChip: {
    height: 24,
  },
  appliedDate: {
    color: colors.textSecondary,
  },
});

export default ApplicantPipelineScreen;
