import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Text, Button, Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { InputField } from '@/components/common/InputField';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { PassionfruitLogo } from '@/components/common/PassionfruitLogo';
import { AuthStackParamList } from '@/navigation/types';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess, setRole } from '@/store/slices/authSlice';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import type { UserRole } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';
import { FadeIn } from '@/components/animations/FadeIn';
import { authApi } from '@/services/authApi';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6).required('Password required'),
});

type FormValues = yup.InferType<typeof schema>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const dispatch = useAppDispatch();
  const { track } = useAnalytics();
  const [role, setRoleState] = React.useState<UserRole>('jobSeeker');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setErrorMessage('');
      setIsLoading(true);
      track('login_attempt', { role, email: values.email });

      // Call real API
      const response = await authApi.login({
        email: values.email,
        password: values.password,
      });

      // Update Redux store with real token and user data
      dispatch(setRole(role));
      dispatch(loginSuccess({
        token: response.token,
        userRole: role
      }));

      track('login_success', { role, email: values.email });
    } catch (error) {
      track('login_error', { role, email: values.email, error: String(error) });

      let errorMsg = 'An unexpected error occurred. Please try again.';

      if (error instanceof Error) {
        // Check for specific error types
        if (error.message.includes('Invalid email or password')) {
          errorMsg = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Network request failed') || error.message.includes('fetch')) {
          errorMsg = 'Unable to connect to the server. Please check your internet connection and ensure the backend is running.';
        } else {
          errorMsg = error.message;
        }
      }

      setErrorMessage(errorMsg);

      // Also show alert for critical errors
      Alert.alert(
        'Login Failed',
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
              <PassionfruitLogo size={140} animated />
              <Text variant="headlineLarge" style={styles.title}>
                Welcome Back
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Sign in to continue your journey
              </Text>
            </View>
          </FadeIn>

          {/* Demo Credentials Card */}
          <FadeIn delay={100}>
            <Card style={styles.demoCard}>
              <Card.Content>
                <View style={styles.demoHeader}>
                  <Text variant="titleMedium" style={styles.demoTitle}>
                    Demo Credentials
                  </Text>
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>TEST</Text>
                  </View>
                </View>
                <View style={styles.demoItem}>
                  <Text variant="bodySmall" style={styles.demoLabel}>
                    Demo Account:
                  </Text>
                  <Text variant="bodyMedium" style={styles.demoValue}>
                    demo@writenow.com / Demo123!
                  </Text>
                </View>
                <View style={styles.demoItem}>
                  <Text variant="bodySmall" style={styles.demoLabel}>
                    Note:
                  </Text>
                  <Text variant="bodySmall" style={styles.demoValue}>
                    Login with real database authentication
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </FadeIn>

          {/* Role Selection */}
          <FadeIn delay={200}>
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
            <FadeIn delay={250}>
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
          <FadeIn delay={300}>
            <View style={styles.formContainer}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <InputField
                    label="Email Address"
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
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

              <View style={styles.actionButtons}>
                <PrimaryButton onPress={onSubmit} loading={isLoading} disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </PrimaryButton>

                <Button
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.linkButton}
                  labelStyle={styles.linkButtonLabel}
                >
                  Forgot your password?
                </Button>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text variant="bodySmall" style={styles.dividerText}>
                    or
                  </Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('Register', { role })}
                  style={styles.registerButton}
                  labelStyle={styles.registerButtonLabel}
                >
                  Create a Free Account
                </Button>
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
  demoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  demoTitle: {
    color: colors.text,
    fontWeight: '600',
  },
  demoBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  demoItem: {
    marginBottom: spacing.sm,
  },
  demoLabel: {
    color: colors.textSecondary,
    marginBottom: 2,
  },
  demoValue: {
    color: colors.text,
    fontWeight: '500',
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
    gap: spacing.sm,
  },
  linkButton: {
    marginTop: spacing.sm,
  },
  linkButtonLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textTertiary,
  },
  registerButton: {
    borderRadius: borderRadius.md,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  registerButtonLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
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

export default LoginScreen;
