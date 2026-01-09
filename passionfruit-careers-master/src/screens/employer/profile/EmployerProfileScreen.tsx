import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { Text, Avatar, Surface, Divider, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { employerApi } from '@/services/employerApi';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';

const EmployerProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { user } = useAppSelector((state) => state.auth);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [token])
  );

  const fetchProfile = async () => {
    if (!token) return;

    try {
      const data = await employerApi.getProfile(token);
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setLogoutModalVisible(false);
  };

  const MenuItem = ({ icon, label, onPress, danger = false }: any) => (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed
      ]}
      onPress={onPress}
    >
      <View style={[styles.menuIconContainer, danger && styles.menuIconContainerDanger]}>
        <Ionicons name={icon} size={20} color={danger ? colors.error : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </Pressable>
  );

  const companyName = profile?.companyName || 'Your Company';
  const industry = profile?.industry || 'Industry';
  const location = profile?.address || 'Location';
  const credits = profile?.credits || 0;

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Profile Section */}
        <LinearGradient
          colors={['#FFF9E6', '#FFFFFF']}
          style={styles.header}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Avatar.Text
                size={80}
                label={companyName.substring(0, 2).toUpperCase()}
                style={{ backgroundColor: colors.primary }}
                color={colors.text}
              />
              <Pressable style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color={colors.background} />
              </Pressable>
            </View>
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.companyName}>{companyName}</Text>
              <Text variant="bodyMedium" style={styles.industry}>
                {industry}{location && ` • ${location}`}
              </Text>
              <View style={styles.planBadge}>
                <Text style={styles.planText}>Pro Plan</Text>
              </View>
            </View>
          </View>

          {/* Credits Card */}
          <Surface style={styles.creditsCard} elevation={2}>
            <View>
              <Text style={styles.creditsLabel}>Available Credits</Text>
              <Text style={styles.creditsValue}>{credits}</Text>
            </View>
            <Pressable
              style={styles.topUpButton}
              onPress={() => navigation.navigate('EmployerCredits' as never)}
            >
              <Text style={styles.topUpText}>Top Up</Text>
            </Pressable>
          </Surface>
        </LinearGradient>

        <View style={styles.content}>
          {/* Company Settings */}
          <Text style={styles.sectionTitle}>Company</Text>
          <Surface style={styles.menuCard}>
            <MenuItem
              icon="business"
              label="Company Profile"
              onPress={() => navigation.navigate('CompanyProfile' as never)}
            />
            <Divider style={styles.divider} />
            <MenuItem
              icon="people"
              label="Team Members"
              onPress={() => navigation.navigate('TeamManagement' as never)}
            />
            <Divider style={styles.divider} />
            <MenuItem
              icon="card"
              label="Billing & Invoices"
              onPress={() => navigation.navigate('EmployerCredits' as never)}
            />
          </Surface>

          {/* App Settings */}
          <Text style={styles.sectionTitle}>Settings</Text>
          <Surface style={styles.menuCard}>
            <MenuItem
              icon="notifications"
              label="Notifications"
              onPress={() => navigation.navigate('NotificationPreferences' as never)}
            />
            <Divider style={styles.divider} />
            <MenuItem
              icon="lock-closed"
              label="Security & Password"
              onPress={() => navigation.navigate('ChangePassword' as never)}
            />
            <Divider style={styles.divider} />
            <MenuItem
              icon="help-circle"
              label="Help & Support"
              onPress={() => navigation.navigate('HelpSupport' as never)}
            />
          </Surface>

          {/* Danger Zone */}
          <Surface style={[styles.menuCard, styles.dangerCard]}>
            <MenuItem
              icon="log-out"
              label="Log Out"
              onPress={() => setLogoutModalVisible(true)}
              danger
            />
          </Surface>

          <Text style={styles.version}>Version 1.0.0 • Passionfruit Careers</Text>
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
        animationType="fade"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="log-out" size={48} color={colors.error} />
            </View>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Log Out
            </Text>
            <Text variant="bodyLarge" style={styles.modalMessage}>
              Are you sure you want to log out?
            </Text>
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setLogoutModalVisible(false)}
                style={styles.modalButton}
                textColor={colors.text}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleLogout}
                style={styles.modalButton}
                buttonColor={colors.error}
                textColor={colors.background}
              >
                Log Out
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.text,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF9E6',
  },
  profileInfo: {
    flex: 1,
  },
  companyName: {
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  industry: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  planBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  planText: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
  creditsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  creditsLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  creditsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  topUpButton: {
    backgroundColor: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
  },
  topUpText: {
    color: colors.background,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  menuItemPressed: {
    backgroundColor: colors.background,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconContainerDanger: {
    backgroundColor: colors.errorLight + '20',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  menuLabelDanger: {
    color: colors.error,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: colors.divider,
    marginLeft: 60, // Align with text
  },
  dangerCard: {
    borderColor: colors.errorLight,
    borderWidth: 1,
  },
  version: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: spacing.sm,
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
    maxWidth: 400,
    width: '100%',
    alignItems: 'center',
    ...shadows.lg,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.error}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  modalMessage: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
  },
});

export default EmployerProfileScreen;
