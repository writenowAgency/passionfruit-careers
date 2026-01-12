import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Text, Button, Card } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { InputField } from '@/components/common/InputField';
import { PassionfruitLogo } from '@/components/common/PassionfruitLogo';
import { FadeIn } from '@/components/animations/FadeIn';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess, setRole } from '@/store/slices/authSlice';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import type { UserRole } from '@/types';
import { authApi } from '@/services/authApi';

const schema = yup.object({
  fullName: yup.string().required('Name is required'),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  company: yup.string().optional(),
});

type FormValues = yup.InferType<typeof schema>;

const RegisterScreen: React.FC = () => {
  const [role, setRoleState] = React.useState<UserRole>('jobSeeker');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);
  const dispatch = useAppDispatch();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema, { context: { role } }),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage('');
      setIsLoading(true);

      // Split full name into first and last name
      const nameParts = values.fullName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || 'Name';

      // Call real API
      const response = await authApi.register({
        email: values.email,
        password: values.password,
        firstName,
        lastName,
      });

      // Update Redux store with real token and user data
      dispatch(setRole(role));
      dispatch(loginSuccess({
        token: response.token,
        userRole: role,
        user: response.user
      }));

      Alert.alert(
        'Success',
        'Your account has been created successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      let errorMsg = 'An unexpected error occurred. Please try again.';

      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('User already exists')) {
          errorMsg = 'An account with this email already exists. Please use a different email or try logging in.';
        } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          errorMsg = 'Unable to connect to the server. Please check your internet connection and ensure the backend is running.';
        } else if (error.message.includes('validation') || error.message.includes('invalid')) {
          errorMsg = 'Please check your input. ' + error.message;
        } else {
          errorMsg = error.message;
        }
      }

      setErrorMessage(errorMsg);

      Alert.alert(
        'Registration Failed',
        errorMsg,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FFFFFF', '#FFF9E6', '#FFFFFF']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <FadeIn delay={0}>
            <View style={styles.logoContainer}>
              <PassionfruitLogo size={100} animated />
              <Text variant="headlineLarge" style={styles.title}>
                Create Your Account
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Join Passionfruit Careers today
              </Text>
            </View>
          </FadeIn>

          {/* Role Selection */}
          <FadeIn delay={100}>
            <View style={styles.roleContainer}>
              <Text variant="labelLarge" style={styles.roleLabel}>
                I am a:
              </Text>
              <View style={styles.roleButtons}>
                {(['jobSeeker', 'employer'] as UserRole[]).map((option) => (
                  <Button
                    key={option}
                    mode={role === option ? 'contained' : 'outlined'}
                    onPress={() => setRoleState(option)}
                    style={[
                      styles.roleButton,
                      role === option && styles.roleButtonActive,
                    ]}
                    labelStyle={[
                      styles.roleButtonLabel,
                      role === option && styles.roleButtonLabelActive,
                    ]}
                    contentStyle={styles.roleButtonContent}
                  >
                    {option === 'jobSeeker' ? 'Job Seeker' : 'Employer'}
                  </Button>
                ))}
              </View>
            </View>
          </FadeIn>

          {/* Error Message */}
          {errorMessage ? (
            <FadeIn delay={150}>
              <Card style={styles.errorCard}>
                <Card.Content>
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text variant="bodyMedium" style={styles.errorText}>
                      {errorMessage}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </FadeIn>
          ) : null}

          {/* Form Fields */}
          <FadeIn delay={200}>
            <View style={styles.formContainer}>
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label="Full Name"
                    value={value}
                    onChangeText={onChange}
                    errorMessage={errors.fullName?.message}
                    autoCapitalize="words"
                  />
                )}
              />

              <View style={styles.fieldSpacing} />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label="Email Address"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    errorMessage={errors.email?.message}
                    autoCapitalize="none"
                  />
                )}
              />

              <View style={styles.fieldSpacing} />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label="Password"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    errorMessage={errors.password?.message}
                  />
                )}
              />

              {role === 'employer' && (
                <>
                  <View style={styles.fieldSpacing} />
                  <Controller
                    control={control}
                    name="company"
                    render={({ field: { onChange, value } }) => (
                      <InputField
                        label="Company Name"
                        value={value}
                        onChangeText={onChange}
                        errorMessage={errors.company?.message}
                      />
                    )}
                  />
                </>
              )}

              <View style={styles.actionButtons}>
                <PrimaryButton onPress={onSubmit} loading={isLoading} disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </PrimaryButton>
              </View>
            </View>
          </FadeIn>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginTop: spacing.lg,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roleContainer: {
    marginBottom: spacing.lg,
  },
  roleLabel: {
    marginBottom: spacing.sm,
    color: colors.text,
    fontWeight: '600',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleButton: {
    flex: 1,
    borderRadius: borderRadius.md,
    borderColor: colors.border,
  },
  roleButtonActive: {
    backgroundColor: colors.primary,
  },
  roleButtonContent: {
    paddingVertical: spacing.sm,
  },
  roleButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  roleButtonLabelActive: {
    color: colors.text,
  },
  formContainer: {
    gap: spacing.md,
  },
  fieldSpacing: {
    height: spacing.sm,
  },
  actionButtons: {
    marginTop: spacing.md,
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorIcon: {
    fontSize: 20,
  },
  errorText: {
    flex: 1,
    color: '#991B1B',
    fontWeight: '500',
  },
});

export default RegisterScreen;
