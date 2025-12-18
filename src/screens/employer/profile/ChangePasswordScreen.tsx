import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { Text, Card, TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';

const ChangePasswordScreen: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return false;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    try {
      // TODO: Implement API call to change password
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Password changed successfully', [
        {
          text: 'OK',
          onPress: () => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: colors.textTertiary };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 33, label: 'Weak', color: colors.error };
    if (strength <= 3) return { strength: 66, label: 'Medium', color: colors.warning };
    return { strength: 100, label: 'Strong', color: colors.success };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <FadeIn delay={0}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed" size={32} color={colors.primary} />
              </View>
              <View style={styles.headerText}>
                <Text variant="headlineSmall" style={styles.title}>
                  Change Password
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Enter your current password and choose a new secure password
                </Text>
              </View>
            </View>

            <View style={styles.form}>
              {/* Current Password */}
              <View style={styles.inputGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Current Password
                </Text>
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  mode="outlined"
                  secureTextEntry={!showCurrentPassword}
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  placeholder="Enter current password"
                  right={
                    <TextInput.Icon
                      icon={showCurrentPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    />
                  }
                />
              </View>

              {/* New Password */}
              <View style={styles.inputGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  New Password
                </Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  mode="outlined"
                  secureTextEntry={!showNewPassword}
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  placeholder="Enter new password"
                  right={
                    <TextInput.Icon
                      icon={showNewPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    />
                  }
                />
                {newPassword.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          {
                            width: `${passwordStrength.strength}%`,
                            backgroundColor: passwordStrength.color,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      variant="bodySmall"
                      style={[styles.strengthLabel, { color: passwordStrength.color }]}
                    >
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Confirm New Password
                </Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  mode="outlined"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  placeholder="Confirm new password"
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                />
                {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                  <Text variant="bodySmall" style={styles.errorText}>
                    Passwords do not match
                  </Text>
                )}
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text variant="labelMedium" style={styles.requirementsTitle}>
                  Password Requirements:
                </Text>
                <View style={styles.requirementsList}>
                  <View style={styles.requirement}>
                    <Ionicons
                      name={newPassword.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={newPassword.length >= 8 ? colors.success : colors.textTertiary}
                    />
                    <Text variant="bodySmall" style={styles.requirementText}>
                      At least 8 characters
                    </Text>
                  </View>
                  <View style={styles.requirement}>
                    <Ionicons
                      name={
                        /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={16}
                      color={
                        /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)
                          ? colors.success
                          : colors.textTertiary
                      }
                    />
                    <Text variant="bodySmall" style={styles.requirementText}>
                      Uppercase and lowercase letters
                    </Text>
                  </View>
                  <View style={styles.requirement}>
                    <Ionicons
                      name={/[0-9]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
                      size={16}
                      color={/[0-9]/.test(newPassword) ? colors.success : colors.textTertiary}
                    />
                    <Text variant="bodySmall" style={styles.requirementText}>
                      At least one number
                    </Text>
                  </View>
                  <View style={styles.requirement}>
                    <Ionicons
                      name={
                        /[^a-zA-Z0-9]/.test(newPassword) ? 'checkmark-circle' : 'ellipse-outline'
                      }
                      size={16}
                      color={
                        /[^a-zA-Z0-9]/.test(newPassword) ? colors.success : colors.textTertiary
                      }
                    />
                    <Text variant="bodySmall" style={styles.requirementText}>
                      At least one special character
                    </Text>
                  </View>
                </View>
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleChangePassword}
                loading={loading}
                disabled={loading}
                style={styles.button}
                buttonColor={colors.primary}
                textColor={colors.background}
              >
                Change Password
              </Button>
            </View>
          </Card.Content>
        </Card>
      </FadeIn>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background,
  },
  strengthContainer: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  strengthBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: borderRadius.pill,
  },
  strengthLabel: {
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    marginTop: spacing.xs,
  },
  requirementsContainer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  requirementsTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  requirementsList: {
    gap: spacing.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  requirementText: {
    color: colors.textSecondary,
    flex: 1,
  },
  button: {
    marginTop: spacing.md,
  },
});

export default ChangePasswordScreen;
