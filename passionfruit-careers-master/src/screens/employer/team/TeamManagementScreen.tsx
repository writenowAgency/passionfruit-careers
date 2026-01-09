import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  Modal,
  TextInput as RNTextInput,
  RefreshControl,
} from 'react-native';
import { Text, Card, Button, Menu, Divider, IconButton, Portal, Dialog, Paragraph, Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { SlideIn } from '@/components/animations/SlideIn';
import { useAppSelector } from '@/store/hooks';
import { employerApi } from '@/services/employerApi';

// Types
interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'recruiter' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  avatar?: string;
  lastActive?: string;
}

const ROLE_COLORS: Record<string, string> = {
  owner: colors.error,
  admin: colors.secondary,
  manager: colors.info,
  recruiter: colors.success,
  viewer: '#9E9E9E',
};

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  recruiter: 'Recruiter',
  viewer: 'Viewer',
};

const TeamManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const auth = useAppSelector((state) => state.auth);
  const token = auth.token;

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // UI State
  const [menuVisible, setMenuVisible] = useState<{ [key: number]: boolean }>({});
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('recruiter');
  
  // Dialog & Feedback
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const fetchTeamMembers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await employerApi.getTeamMembers(token);
      // Map API response to TeamMember type if needed, mostly matches
      setTeamMembers(response.members);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      setSnackbarMessage('Failed to load team members');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamMembers();
  };

  const activeMembers = teamMembers.filter((m) => m.status === 'active').length;
  const pendingInvites = teamMembers.filter((m) => m.status === 'pending').length;

  const toggleMenu = (memberId: number) => {
    setMenuVisible((prev) => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  const confirmRemoveMember = (member: TeamMember) => {
    setSelectedMember(member);
    setDeleteDialogVisible(true);
    toggleMenu(member.id); // Close menu
  };

  const handleRemoveMember = async () => {
    if (!token || !selectedMember) return;
    
    setDeleteDialogVisible(false);
    try {
      await employerApi.removeTeamMember(token, selectedMember.id);
      setSnackbarMessage(`${selectedMember.name} has been removed.`);
      setSnackbarVisible(true);
      fetchTeamMembers(); // Refresh list
    } catch (error) {
      console.error('Remove error:', error);
      setSnackbarMessage('Failed to remove member');
      setSnackbarVisible(true);
    } finally {
      setSelectedMember(null);
    }
  };

  const handleResendInvite = async (member: TeamMember) => {
    // For now just show success, real implementation would resend email
    setSnackbarMessage(`Invitation resent to ${member.email}`);
    setSnackbarVisible(true);
    toggleMenu(member.id);
  };

  const handleChangeRole = async (member: TeamMember, newRole: TeamMember['role']) => {
    if (!token) return;
    toggleMenu(member.id);
    
    try {
      await employerApi.updateTeamMemberRole(token, member.id, newRole);
      setSnackbarMessage(`${member.name}'s role updated to ${ROLE_LABELS[newRole]}`);
      setSnackbarVisible(true);
      fetchTeamMembers(); // Refresh list
    } catch (error) {
      console.error('Update role error:', error);
      setSnackbarMessage('Failed to update role');
      setSnackbarVisible(true);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      setSnackbarMessage('Please enter an email address');
      setSnackbarVisible(true);
      return;
    }
    if (!token) return;

    try {
      await employerApi.inviteTeamMember(token, inviteEmail, inviteRole);
      setSnackbarMessage(`Invitation sent to ${inviteEmail}`);
      setSnackbarVisible(true);
      setInviteModalVisible(false);
      setInviteEmail('');
      setInviteRole('recruiter');
      fetchTeamMembers(); // Refresh list
    } catch (error) {
      console.error('Invite error:', error);
      setSnackbarMessage('Failed to invite member');
      setSnackbarVisible(true);
    }
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'inactive':
        return '#9E9E9E';
      default:
        return colors.textSecondary;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'TM';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <FadeIn delay={0}>
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
            <Text variant="headlineMedium" style={styles.title}>
              Team Management
            </Text>
          </View>
        </FadeIn>

        {/* Stats Cards */}
        <FadeIn delay={100}>
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={[colors.primaryLight, '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Ionicons name="people" size={32} color={colors.primary} />
              <Text variant="headlineMedium" style={styles.statValue}>
                {teamMembers.length}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Total Members
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={[colors.successLight, '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Ionicons name="checkmark-circle" size={32} color={colors.success} />
              <Text variant="headlineMedium" style={styles.statValue}>
                {activeMembers}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Active
              </Text>
            </LinearGradient>

            <LinearGradient
              colors={[colors.warningLight, '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.statCard}
            >
              <Ionicons name="time" size={32} color={colors.warning} />
              <Text variant="headlineMedium" style={styles.statValue}>
                {pendingInvites}
              </Text>
              <Text variant="bodyMedium" style={styles.statLabel}>
                Pending
              </Text>
            </LinearGradient>
          </View>
        </FadeIn>

        {/* Invite Button */}
        <FadeIn delay={150}>
          <Pressable
            style={styles.inviteButton}
            onPress={() => setInviteModalVisible(true)}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.inviteButtonGradient}
            >
              <Ionicons name="person-add" size={20} color={colors.surface} />
              <Text variant="labelLarge" style={styles.inviteButtonText}>
                Invite Team Member
              </Text>
            </LinearGradient>
          </Pressable>
        </FadeIn>

        {/* Team Members List */}
        <View style={styles.membersSection}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Team Members
          </Text>

          {teamMembers.length === 0 && !loading ? (
             <Text style={{textAlign: 'center', color: colors.textSecondary, marginTop: 20}}>
               No team members found. Invite someone to get started!
             </Text>
          ) : (
            teamMembers.map((member, index) => (
              <SlideIn key={member.id} delay={200 + index * 50}>
                <Card style={styles.memberCard}>
                  <View style={styles.memberContent}>
                    {/* Avatar */}
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: ROLE_COLORS[member.role] + '20' },
                      ]}
                    >
                      <Text
                        variant="titleMedium"
                        style={[styles.avatarText, { color: ROLE_COLORS[member.role] }]}
                      >
                        {getInitials(member.name)}
                      </Text>
                    </View>

                    {/* Member Info */}
                    <View style={styles.memberInfo}>
                      <View style={styles.memberNameRow}>
                        <Text variant="titleMedium" style={styles.memberName}>
                          {member.name}
                        </Text>
                        {/* Status Indicator */}
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(member.status) },
                          ]}
                        />
                      </View>
                      <Text variant="bodyMedium" style={styles.memberEmail}>
                        {member.email}
                      </Text>
                      <View style={styles.memberMeta}>
                        {/* Role Badge */}
                        <View
                          style={[
                            styles.roleBadge,
                            { backgroundColor: ROLE_COLORS[member.role] + '20' },
                          ]}
                        >
                          <Text
                            variant="labelSmall"
                            style={[styles.roleText, { color: ROLE_COLORS[member.role] }]}
                          >
                            {ROLE_LABELS[member.role]}
                          </Text>
                        </View>
                        {member.lastActive && (
                          <Text variant="bodySmall" style={styles.lastActive}>
                            • {new Date(member.lastActive).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Actions Menu */}
                    {member.role !== 'owner' && (
                      <Menu
                        visible={menuVisible[member.id] || false}
                        onDismiss={() => toggleMenu(member.id)}
                        anchor={
                          <IconButton
                            icon="dots-vertical"
                            size={24}
                            onPress={() => toggleMenu(member.id)}
                          />
                        }
                      >
                        {member.status === 'pending' && (
                          <Menu.Item
                            onPress={() => {
                              handleResendInvite(member);
                            }}
                            title="Resend Invite"
                            leadingIcon="email"
                          />
                        )}
                        {member.status === 'active' && (
                          <>
                            <Menu.Item
                              onPress={() => handleChangeRole(member, 'admin')}
                              title="Make Admin"
                              leadingIcon="shield-account"
                              disabled={member.role === 'admin'}
                            />
                            <Menu.Item
                              onPress={() => handleChangeRole(member, 'manager')}
                              title="Make Manager"
                              leadingIcon="account-tie"
                              disabled={member.role === 'manager'}
                            />
                            <Menu.Item
                              onPress={() => handleChangeRole(member, 'recruiter')}
                              title="Make Recruiter"
                              leadingIcon="account-search"
                              disabled={member.role === 'recruiter'}
                            />
                            <Menu.Item
                              onPress={() => handleChangeRole(member, 'viewer')}
                              title="Make Viewer"
                              leadingIcon="eye"
                              disabled={member.role === 'viewer'}
                            />
                            <Divider />
                          </>
                        )}
                        <Menu.Item
                          onPress={() => {
                            confirmRemoveMember(member);
                          }}
                          title="Remove"
                          leadingIcon="account-remove"
                          titleStyle={{ color: colors.error }}
                        />
                      </Menu>
                    )}
                  </View>
                </Card>
              </SlideIn>
            ))
          )}
        </View>
      </ScrollView>

      {/* Invite Modal */}
      <Modal
        visible={inviteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setInviteModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Invite Team Member
            </Text>

            <View style={styles.inputContainer}>
              <Text variant="labelLarge" style={styles.inputLabel}>
                Email Address
              </Text>
              <RNTextInput
                style={styles.input}
                placeholder="member@company.com"
                placeholderTextColor={colors.textSecondary}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text variant="labelLarge" style={styles.inputLabel}>
                Role
              </Text>
              <View style={styles.roleSelector}>
                {(['admin', 'manager', 'recruiter', 'viewer'] as const).map((role) => (
                  <Pressable
                    key={role}
                    style={[
                      styles.roleOption,
                      inviteRole === role && styles.roleOptionSelected,
                      { borderColor: ROLE_COLORS[role] },
                    ]}
                    onPress={() => setInviteRole(role)}
                  >
                    <Text
                      variant="labelMedium"
                      style={[
                        styles.roleOptionText,
                        inviteRole === role && {
                          color: ROLE_COLORS[role],
                          fontWeight: '600',
                        },
                      ]}
                    >
                      {ROLE_LABELS[role]}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setInviteModalVisible(false)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleInviteMember}
                style={styles.modalButton}
                buttonColor={colors.primary}
              >
                Send Invite
              </Button>
            </View>
          </Pressable>
        </Pressable>
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

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Remove Team Member</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to remove {selectedMember?.name} from your team?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleRemoveMember} textColor="#d32f2f">Remove</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  statValue: {
    color: colors.text,
    fontWeight: '700',
  },
  statLabel: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  inviteButton: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  inviteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  inviteButtonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  membersSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  memberCard: {
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  memberContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  memberName: {
    color: colors.text,
    fontWeight: '600',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  memberEmail: {
    color: colors.textSecondary,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  roleText: {
    fontWeight: '600',
    fontSize: 12,
  },
  lastActive: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 500,
    ...shadows.xl,
  },
  modalTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleOptionSelected: {
    backgroundColor: colors.primaryLight,
  },
  roleOptionText: {
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
  },
});

export default TeamManagementScreen;
