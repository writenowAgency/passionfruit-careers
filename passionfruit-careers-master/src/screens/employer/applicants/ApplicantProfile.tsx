import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Dimensions, Linking, Alert, Modal, TouchableOpacity } from 'react-native';
import { Text, Card, Button, Chip, Divider, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, RouteProp } from '@react-navigation/native';
import { employerApi, ApplicantDetails } from '@/services/employerApi';
import { useAppSelector } from '@/store/hooks';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { EmployerApplicantsStackParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

type ApplicantProfileRouteProp = RouteProp<EmployerApplicantsStackParamList, 'ApplicantProfile'>;

const EmployerApplicantProfile: React.FC = () => {
  const route = useRoute<ApplicantProfileRouteProp>();
  const token = useAppSelector((state) => state.auth.token);
  const { applicantId } = route.params;

  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState<ApplicantDetails | null>(null);
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    fetchApplicantDetails();
  }, [applicantId]);

  const fetchApplicantDetails = async () => {
    if (!token) return;

    try {
      setLoading(true);
      console.log('Fetching applicant details for application ID:', applicantId);
      const data = await employerApi.getApplicantDetails(token, applicantId);
      console.log('Applicant details:', data);
      setApplicant(data);
    } catch (error) {
      console.error('Failed to fetch applicant details:', error);
      Alert.alert('Error', 'Failed to load applicant profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleUpdateStatus = async (newStatus: 'reviewed' | 'shortlisted' | 'accepted' | 'rejected' | 'interview') => {
    if (!token || !applicant) return;

    try {
      setUpdatingStatus(true);
      console.log('Updating application status to:', newStatus);
      const response = await employerApi.updateApplicationStatus(token, applicant.application.id, newStatus);
      console.log('Status update response:', response);

      // Update local state
      setApplicant({
        ...applicant,
        application: {
          ...applicant.application,
          status: newStatus,
        },
      });

      setSnackbarMessage(`Application marked as ${newStatus}`);
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Failed to update status:', error);
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to update application status');
      setSnackbarVisible(true);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDocumentPress = (fileUrl: string, documentName: string) => {
    console.log('=== DOCUMENT VIEW ===');
    console.log('File URL:', fileUrl);
    console.log('Document name:', documentName);

    try {
      if (!fileUrl) {
        Alert.alert('Error', 'Document URL not available');
        return;
      }

      console.log('Opening PDF modal with direct R2 URL:', fileUrl);

      // Open in modal with iframe using direct R2 URL
      setPdfUrl(fileUrl);
      setPdfModalVisible(true);
    } catch (error: any) {
      console.error('Error viewing document:', error);
      Alert.alert('Error', `Failed to view document: ${error.message}`);
    }
  };

  const handleDocumentDownload = async (documentId: number, documentName: string) => {
    console.log('=== DOCUMENT DOWNLOAD ===');
    console.log('Document ID:', documentId);
    console.log('Document name:', documentName);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const url = `${apiUrl}/api/employer/documents/${documentId}`;

      console.log('Fetching from proxy:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status}`);
      }

      // Get the response as a blob
      const blob = await response.blob();
      console.log('Blob received:', {
        size: blob.size,
        type: blob.type,
      });

      // Create a blob with explicit PDF MIME type if not set
      const pdfBlob = blob.type === 'application/pdf'
        ? blob
        : new Blob([blob], { type: 'application/pdf' });

      const blobUrl = URL.createObjectURL(pdfBlob);
      console.log('Downloading from blob URL');

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        console.log('Download blob URL revoked');
      }, 100);

      console.log('Download initiated successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('Error', `Failed to download document: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const formatMatchScore = (score: number) => {
    if (score >= 80) return { color: colors.success, label: 'Excellent Match' };
    if (score >= 60) return { color: colors.warning, label: 'Good Match' };
    return { color: colors.accent, label: 'Fair Match' };
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Loading applicant profile...
        </Text>
      </View>
    );
  }

  if (!applicant) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="bodyLarge">Applicant not found</Text>
      </View>
    );
  }

  const matchInfo = formatMatchScore(applicant.application.matchScore);

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <FadeIn delay={0}>
        <LinearGradient
          colors={['#FFF9E6', colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              {applicant.profile?.profilePhotoUrl ? (
                <img
                  src={applicant.profile.profilePhotoUrl}
                  alt="Profile"
                  style={styles.avatar as any}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={48} color={colors.primary} />
                </View>
              )}
            </View>

            <View style={styles.headerInfo}>
              <Text variant="headlineMedium" style={styles.name}>
                {applicant.user.fullName}
              </Text>
              {applicant.profile?.headline && (
                <Text variant="titleMedium" style={styles.headline}>
                  {applicant.profile.headline}
                </Text>
              )}
              {applicant.profile?.location && (
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={16} color={colors.textSecondary} />
                  <Text variant="bodyMedium" style={styles.location}>
                    {applicant.profile.location}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Match Score Badge */}
          <View style={styles.matchBadge}>
            <Chip
              icon={() => <Ionicons name="star" size={16} color={matchInfo.color} />}
              style={[styles.matchChip, { borderColor: matchInfo.color }]}
              textStyle={[styles.matchChipText, { color: matchInfo.color }]}
            >
              {applicant.application.matchScore}% Match
            </Chip>
          </View>
        </LinearGradient>
      </FadeIn>

      {/* Application Info */}
      <FadeIn delay={50}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Application Details
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Applied for:</Text>
              <Text style={styles.value}>{applicant.application.jobTitle}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Applied on:</Text>
              <Text style={styles.value}>{formatDate(applicant.application.appliedAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status:</Text>
              <Chip
                style={[
                  styles.statusChip,
                  applicant.application.status === 'pending' && styles.statusPending,
                  applicant.application.status === 'reviewed' && styles.statusReviewed,
                  applicant.application.status === 'accepted' && styles.statusAccepted,
                ]}
              >
                {applicant.application.status}
              </Chip>
            </View>
            {applicant.application.coverLetter && (
              <>
                <Divider style={styles.divider} />
                <Text style={styles.label}>Cover Letter:</Text>
                <Text style={styles.coverLetter}>{applicant.application.coverLetter}</Text>
              </>
            )}
          </Card.Content>
        </Card>
      </FadeIn>

      {/* Action Buttons */}
      {applicant.application.status !== 'accepted' && applicant.application.status !== 'rejected' && (
        <FadeIn delay={75}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={[styles.sectionTitle, { marginBottom: spacing.md }]}>
                Review Actions
              </Text>
              <View style={styles.actionButtonsGrid}>
                <Button
                  mode="outlined"
                  icon={() => <Ionicons name="eye" size={18} color={colors.primary} />}
                  onPress={() => handleUpdateStatus('reviewed')}
                  loading={updatingStatus}
                  disabled={updatingStatus || applicant.application.status === 'reviewed'}
                  style={[styles.actionButton, applicant.application.status === 'reviewed' && styles.actionButtonActive]}
                  labelStyle={styles.actionButtonLabel}
                >
                  Reviewed
                </Button>
                <Button
                  mode="outlined"
                  icon={() => <Ionicons name="star" size={18} color={colors.primary} />}
                  onPress={() => handleUpdateStatus('shortlisted')}
                  loading={updatingStatus}
                  disabled={updatingStatus || applicant.application.status === 'shortlisted'}
                  style={[styles.actionButton, applicant.application.status === 'shortlisted' && styles.actionButtonActive]}
                  labelStyle={styles.actionButtonLabel}
                >
                  Shortlist
                </Button>
                <Button
                  mode="outlined"
                  icon={() => <Ionicons name="calendar" size={18} color={colors.primary} />}
                  onPress={() => handleUpdateStatus('interview')}
                  loading={updatingStatus}
                  disabled={updatingStatus || applicant.application.status === 'interview'}
                  style={[styles.actionButton, applicant.application.status === 'interview' && styles.actionButtonActive]}
                  labelStyle={styles.actionButtonLabel}
                >
                  Interview
                </Button>
              </View>
              <View style={styles.finalActionsRow}>
                <Button
                  mode="contained"
                  icon={() => <Ionicons name="checkmark-circle" size={18} color="white" />}
                  onPress={() => handleUpdateStatus('accepted')}
                  loading={updatingStatus}
                  disabled={updatingStatus}
                  style={styles.acceptButton}
                  labelStyle={styles.actionButtonLabel}
                  buttonColor={colors.success}
                >
                  Accept
                </Button>
                <Button
                  mode="contained"
                  icon={() => <Ionicons name="close-circle" size={18} color="white" />}
                  onPress={() => handleUpdateStatus('rejected')}
                  loading={updatingStatus}
                  disabled={updatingStatus}
                  style={styles.rejectButton}
                  labelStyle={styles.actionButtonLabel}
                  buttonColor={colors.error}
                >
                  Reject
                </Button>
              </View>
            </Card.Content>
          </Card>
        </FadeIn>
      )}

      {/* Contact Information */}
      <FadeIn delay={100}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Contact Information
            </Text>
            <View style={styles.contactRow}>
              <Ionicons name="mail" size={20} color={colors.primary} />
              <Text
                style={styles.contactLink}
                onPress={() => handleEmailPress(applicant.user.email)}
              >
                {applicant.user.email}
              </Text>
            </View>
            {applicant.profile?.phone && (
              <View style={styles.contactRow}>
                <Ionicons name="call" size={20} color={colors.primary} />
                <Text
                  style={styles.contactLink}
                  onPress={() => handlePhonePress(applicant.profile.phone!)}
                >
                  {applicant.profile.phone}
                </Text>
              </View>
            )}
            {applicant.profile?.linkedinUrl && (
              <View style={styles.contactRow}>
                <Ionicons name="logo-linkedin" size={20} color={colors.primary} />
                <Text
                  style={styles.contactLink}
                  onPress={() => handleLinkPress(applicant.profile!.linkedinUrl!)}
                >
                  LinkedIn Profile
                </Text>
              </View>
            )}
            {applicant.profile?.portfolioUrl && (
              <View style={styles.contactRow}>
                <Ionicons name="briefcase" size={20} color={colors.primary} />
                <Text
                  style={styles.contactLink}
                  onPress={() => handleLinkPress(applicant.profile!.portfolioUrl!)}
                >
                  Portfolio
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </FadeIn>

      {/* About */}
      {applicant.profile?.bio && (
        <FadeIn delay={150}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                About
              </Text>
              <Text style={styles.bioText}>{applicant.profile.bio}</Text>
            </Card.Content>
          </Card>
        </FadeIn>
      )}

      {/* Skills */}
      {applicant.skills.length > 0 && (
        <FadeIn delay={200}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Skills
              </Text>
              <View style={styles.skillsContainer}>
                {applicant.skills.map((skill) => (
                  <Chip key={skill.id} style={styles.skillChip}>
                    {skill.name}
                    {skill.proficiencyLevel && ` (${skill.proficiencyLevel})`}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        </FadeIn>
      )}

      {/* Experience */}
      {applicant.experience.length > 0 && (
        <FadeIn delay={250}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Experience
              </Text>
              {applicant.experience.map((exp, index) => (
                <View key={exp.id} style={styles.experienceItem}>
                  {index > 0 && <Divider style={styles.itemDivider} />}
                  <Text style={styles.experienceTitle}>{exp.jobTitle}</Text>
                  <Text style={styles.experienceCompany}>
                    {exp.companyName}
                    {exp.location && ` • ${exp.location}`}
                  </Text>
                  <Text style={styles.experienceDates}>
                    {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate!)}
                  </Text>
                  {exp.description && (
                    <Text style={styles.experienceDescription}>{exp.description}</Text>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        </FadeIn>
      )}

      {/* Education */}
      {applicant.education.length > 0 && (
        <FadeIn delay={300}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Education
              </Text>
              {applicant.education.map((edu, index) => (
                <View key={edu.id} style={styles.educationItem}>
                  {index > 0 && <Divider style={styles.itemDivider} />}
                  <Text style={styles.educationDegree}>{edu.degree}</Text>
                  <Text style={styles.educationInstitution}>{edu.institutionName}</Text>
                  {edu.fieldOfStudy && (
                    <Text style={styles.educationField}>{edu.fieldOfStudy}</Text>
                  )}
                  <Text style={styles.educationDates}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate!)}
                  </Text>
                  {edu.grade && (
                    <Text style={styles.educationGrade}>Grade: {edu.grade}</Text>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        </FadeIn>
      )}

      {/* Certifications */}
      {applicant.certifications.length > 0 && (
        <FadeIn delay={350}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Certifications
              </Text>
              {applicant.certifications.map((cert, index) => (
                <View key={cert.id} style={styles.certificationItem}>
                  {index > 0 && <Divider style={styles.itemDivider} />}
                  <Text style={styles.certificationName}>{cert.certificationName}</Text>
                  <Text style={styles.certificationOrg}>{cert.issuingOrganization}</Text>
                  <Text style={styles.certificationDates}>
                    Issued {formatDate(cert.issueDate)}
                    {cert.expiryDate && ` • Expires ${formatDate(cert.expiryDate)}`}
                  </Text>
                  {cert.credentialUrl && (
                    <Text
                      style={styles.credentialLink}
                      onPress={() => handleLinkPress(cert.credentialUrl!)}
                    >
                      View Credential
                    </Text>
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        </FadeIn>
      )}

      {/* Languages */}
      {applicant.languages.length > 0 && (
        <FadeIn delay={400}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Languages
              </Text>
              <View style={styles.languagesContainer}>
                {applicant.languages.map((lang) => (
                  <Chip key={lang.id} style={styles.languageChip}>
                    {lang.languageName} ({lang.proficiencyLevel})
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        </FadeIn>
      )}

      {/* Documents */}
      {applicant.documents.length > 0 && (
        <FadeIn delay={450}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Documents
              </Text>
              {applicant.documents.map((doc) => (
                <View key={doc.id} style={styles.documentItem}>
                  <View style={styles.documentInfo}>
                    <Ionicons
                      name={
                        doc.documentType === 'cv' ? 'document-text' :
                        doc.documentType === 'certificate' ? 'ribbon' :
                        doc.documentType === 'portfolio' ? 'briefcase' :
                        'document'
                      }
                      size={24}
                      color={colors.primary}
                    />
                    <View style={styles.documentDetails}>
                      <Text style={styles.documentName}>{doc.documentName}</Text>
                      <Text style={styles.documentType}>
                        {doc.documentType.toUpperCase()}
                        {doc.fileSize && ` • ${(doc.fileSize / 1024).toFixed(0)} KB`}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button
                      mode="outlined"
                      onPress={() => handleDocumentPress(doc.fileUrl, doc.documentName)}
                      compact
                    >
                      View
                    </Button>
                    <Button
                      mode="contained"
                      onPress={() => handleDocumentDownload(doc.id, doc.documentName)}
                      compact
                    >
                      Download
                    </Button>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        </FadeIn>
      )}

      {/* Career Info */}
      {applicant.profile && (applicant.profile.yearsOfExperience || applicant.profile.careerObjectives) && (
        <FadeIn delay={500}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Career Information
              </Text>
              {applicant.profile.yearsOfExperience !== null && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Years of Experience:</Text>
                  <Text style={styles.value}>{applicant.profile.yearsOfExperience} years</Text>
                </View>
              )}
              {applicant.profile.preferredWorkType && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Preferred Work Type:</Text>
                  <Text style={styles.value}>{applicant.profile.preferredWorkType}</Text>
                </View>
              )}
              {applicant.profile.desiredSalaryMin && applicant.profile.desiredSalaryMax && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Salary Expectation:</Text>
                  <Text style={styles.value}>
                    {applicant.profile.salaryCurrency} {applicant.profile.desiredSalaryMin.toLocaleString()} - {applicant.profile.desiredSalaryMax.toLocaleString()}
                  </Text>
                </View>
              )}
              {applicant.profile.availabilityStartDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Available From:</Text>
                  <Text style={styles.value}>{formatDate(applicant.profile.availabilityStartDate)}</Text>
                </View>
              )}
              {applicant.profile.careerObjectives && (
                <>
                  <Divider style={styles.divider} />
                  <Text style={styles.label}>Career Objectives:</Text>
                  <Text style={styles.objectives}>{applicant.profile.careerObjectives}</Text>
                </>
              )}
            </Card.Content>
          </Card>
        </FadeIn>
      )}
    </ScrollView>

    <Modal
      visible={pdfModalVisible}
      onRequestClose={() => setPdfModalVisible(false)}
      animationType="slide"
      transparent={false}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Document Viewer</Text>
          <TouchableOpacity
            onPress={() => setPdfModalVisible(false)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
        {pdfUrl && (
          <iframe
            src={pdfUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="PDF Viewer"
          />
        )}
      </View>
    </Modal>

    <Snackbar
      visible={snackbarVisible}
      onDismiss={() => setSnackbarVisible(false)}
      duration={3000}
      action={{
        label: 'Close',
        onPress: () => setSnackbarVisible(false),
      }}
    >
      {snackbarMessage}
    </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  headerCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  headerContent: {
    flexDirection: isTablet ? 'row' : 'column',
    alignItems: isTablet ? 'center' : 'flex-start',
    gap: spacing.lg,
  },
  avatarContainer: {
    alignSelf: isTablet ? 'flex-start' : 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${colors.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontWeight: '700',
  },
  headline: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  location: {
    color: colors.textSecondary,
  },
  matchBadge: {
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  matchChip: {
    backgroundColor: colors.background,
    borderWidth: 2,
  },
  matchChipText: {
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  value: {
    color: colors.text,
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  statusChip: {
    textTransform: 'capitalize',
  },
  statusPending: {
    backgroundColor: `${colors.warning}20`,
  },
  statusReviewed: {
    backgroundColor: `${colors.info}20`,
  },
  statusAccepted: {
    backgroundColor: `${colors.success}20`,
  },
  divider: {
    marginVertical: spacing.md,
  },
  coverLetter: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  contactLink: {
    color: colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  bioText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillChip: {
    backgroundColor: `${colors.primary}15`,
  },
  experienceItem: {
    marginBottom: spacing.md,
  },
  itemDivider: {
    marginBottom: spacing.md,
  },
  experienceTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  experienceCompany: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  experienceDates: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  experienceDescription: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  educationItem: {
    marginBottom: spacing.md,
  },
  educationDegree: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  educationInstitution: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  educationField: {
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  educationDates: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  educationGrade: {
    color: colors.text,
    fontSize: 13,
  },
  certificationItem: {
    marginBottom: spacing.md,
  },
  certificationName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  certificationOrg: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  certificationDates: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  credentialLink: {
    color: colors.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageChip: {
    backgroundColor: `${colors.secondary}15`,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs / 2,
  },
  documentType: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  objectives: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  actionButtonsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonLabel: {
    fontSize: 12,
  },
  actionButtonActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: `${colors.primary}10`,
  },
  finalActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
  },
});

export default EmployerApplicantProfile;
