import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Modal, Pressable } from 'react-native';
import { Text, Button, Chip, Divider, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Application } from '@/services/jobSeekerApi';
import { colors, spacing, borderRadius } from '@/theme';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

interface ApplicationDetailsModalProps {
  visible: boolean;
  application: Application | null;
  onClose: () => void;
  onWithdraw: (applicationId: number) => void;
  withdrawing?: boolean;
}

/**
 * Application Details Modal Component
 *
 * Displays full job and application details including:
 * - Job information
 * - Company information
 * - Application status
 * - Withdraw option
 */
const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  visible,
  application,
  onClose,
  onWithdraw,
  withdrawing = false,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!application) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
      case 'interview':
        return colors.success;
      case 'rejected':
      case 'withdrawn':
        return colors.error;
      case 'reviewed':
        return colors.info;
      case 'pending':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return 'checkmark-circle';
      case 'interview':
        return 'people';
      case 'rejected':
        return 'close-circle';
      case 'withdrawn':
        return 'arrow-undo';
      case 'reviewed':
        return 'eye';
      case 'pending':
        return 'time';
      default:
        return 'document-text';
    }
  };

  const formatSalary = (min: string | null, max: string | null, currency: string | null) => {
    if (!min && !max) return 'Not specified';

    const formatValue = (value: string) => {
      const num = parseInt(value);
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      return `${(num / 1000).toFixed(0)}k`;
    };

    const symbol = currency === 'ZAR' ? 'R' : currency || 'R';
    if (min && max) return `${symbol}${formatValue(min)} - ${formatValue(max)}`;
    if (min) return `From ${symbol}${formatValue(min)}`;
    if (max) return `Up to ${symbol}${formatValue(max)}`;
    return 'Not specified';
  };

  const handleWithdraw = () => {
    console.log('[ApplicationDetailsModal] Opening withdraw confirmation');
    setShowConfirmModal(true);
  };

  const handleConfirmWithdraw = () => {
    console.log('[ApplicationDetailsModal] Confirming withdrawal for application:', application.id);
    setShowConfirmModal(false);
    onWithdraw(application.id);
  };

  const canWithdraw = !['rejected', 'withdrawn', 'hired'].includes(application.status.toLowerCase());
  const isJobClosed = application.jobStatus === 'closed' || application.jobStatus === 'draft';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Application Details</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <Divider />

          {/* Content */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Job Title & Company */}
            <View style={styles.section}>
              <Text style={styles.jobTitle}>{application.jobTitle}</Text>
              <Text style={styles.company}>{application.company}</Text>

              <View style={styles.statusRow}>
                <Chip
                  mode="flat"
                  icon={getStatusIcon(application.status) as any}
                  textStyle={[
                    styles.statusChipText,
                    { color: getStatusColor(application.status) },
                  ]}
                  style={[
                    styles.statusChip,
                    { backgroundColor: `${getStatusColor(application.status)}15` },
                  ]}
                >
                  {application.status}
                </Chip>

                {isJobClosed && (
                  <Chip
                    mode="flat"
                    icon="lock-closed"
                    textStyle={styles.closedChipText}
                    style={styles.closedChip}
                  >
                    Job Closed
                  </Chip>
                )}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Key Information */}
            <Surface style={styles.infoCard} elevation={0}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue}>{application.location || 'Not specified'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="briefcase" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Job Type</Text>
                  <Text style={styles.infoValue}>{application.jobType || 'Not specified'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="cash" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Salary Range</Text>
                  <Text style={styles.infoValue}>
                    {formatSalary(application.salaryMin, application.salaryMax, application.salaryCurrency)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Applied On</Text>
                  <Text style={styles.infoValue}>
                    {new Date(application.appliedAt).toLocaleDateString('en-ZA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              {application.matchScore && (
                <View style={styles.infoRow}>
                  <Ionicons name="analytics" size={20} color={colors.primary} />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Match Score</Text>
                    <Text style={styles.infoValue}>{application.matchScore}%</Text>
                  </View>
                </View>
              )}
            </Surface>

            {/* Job Description */}
            {application.jobDescription && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Job Description</Text>
                <Text style={styles.sectionText}>{application.jobDescription}</Text>
              </View>
            )}

            {/* Requirements */}
            {application.requirements && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Requirements</Text>
                <Text style={styles.sectionText}>{application.requirements}</Text>
              </View>
            )}

            {/* Responsibilities */}
            {application.responsibilities && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Responsibilities</Text>
                <Text style={styles.sectionText}>{application.responsibilities}</Text>
              </View>
            )}

            {/* Benefits */}
            {application.benefits && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Benefits</Text>
                <Text style={styles.sectionText}>{application.benefits}</Text>
              </View>
            )}

            {/* Cover Letter */}
            {application.coverLetter && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Cover Letter</Text>
                <Surface style={styles.coverLetterCard} elevation={0}>
                  <Text style={styles.coverLetterText}>{application.coverLetter}</Text>
                </Surface>
              </View>
            )}

            {/* Company Information */}
            {application.companyDescription && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About {application.company}</Text>
                <Text style={styles.sectionText}>{application.companyDescription}</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {canWithdraw && !isJobClosed ? (
              <Button
                mode="outlined"
                onPress={handleWithdraw}
                loading={withdrawing}
                disabled={withdrawing}
                style={styles.withdrawButton}
                textColor={colors.error}
                icon="arrow-undo"
              >
                {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
              </Button>
            ) : (
              <View style={styles.infoMessage}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={isJobClosed ? colors.textSecondary : colors.error}
                />
                <Text style={styles.infoMessageText}>
                  {isJobClosed
                    ? 'This job posting is now closed'
                    : 'Application cannot be withdrawn'}
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              onPress={onClose}
              style={styles.closeActionButton}
              buttonColor={colors.primary}
            >
              Close
            </Button>
          </View>
        </View>
      </View>

      {/* Confirm Withdraw Modal */}
      <ConfirmModal
        visible={showConfirmModal}
        title="Withdraw Application"
        message="Are you sure you want to withdraw your application? This action cannot be undone."
        onConfirm={handleConfirmWithdraw}
        onDismiss={() => setShowConfirmModal(false)}
        confirmText="Withdraw"
        cancelText="Cancel"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  company: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  statusChip: {
    height: 36,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  closedChip: {
    height: 36,
    backgroundColor: colors.surfaceVariant,
  },
  closedChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  divider: {
    marginVertical: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  coverLetterCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  coverLetterText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  footer: {
    padding: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  withdrawButton: {
    borderRadius: borderRadius.lg,
    borderColor: colors.error,
  },
  closeActionButton: {
    borderRadius: borderRadius.lg,
  },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.md,
  },
  infoMessageText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default ApplicationDetailsModal;
