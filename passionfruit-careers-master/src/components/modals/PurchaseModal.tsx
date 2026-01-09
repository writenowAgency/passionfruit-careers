import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, IconButton, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { CreditPackage } from '../cards/CreditPackageCard';

interface PurchaseModalProps {
  visible: boolean;
  package: CreditPackage | null;
  onClose: () => void;
  onPurchase: (paymentDetails: PaymentDetails) => Promise<void>;
  processing: boolean;
}

export interface PaymentDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  email: string;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  visible,
  package: pkg,
  onClose,
  onPurchase,
  processing,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardNumber(formatted);
    if (errors.cardNumber) setErrors({ ...errors, cardNumber: '' });
  };

  const handleExpiryDateChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setExpiryDate(formatted);
    if (errors.expiryDate) setErrors({ ...errors, expiryDate: '' });
  };

  const handleCvvChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').substring(0, 4);
    setCvv(cleaned);
    if (errors.cvv) setErrors({ ...errors, cvv: '' });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Card number validation (16 digits)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cleanCardNumber.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    } else if (!/^\d+$/.test(cleanCardNumber)) {
      newErrors.cardNumber = 'Card number must contain only digits';
    }

    // Card holder validation
    if (!cardHolder.trim()) {
      newErrors.cardHolder = 'Card holder name is required';
    } else if (cardHolder.trim().length < 3) {
      newErrors.cardHolder = 'Name must be at least 3 characters';
    }

    // Expiry date validation (MM/YY)
    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (expiryDate.length !== 5) {
      newErrors.expiryDate = 'Invalid expiry date format (MM/YY)';
    } else {
      const [month, year] = expiryDate.split('/');
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt('20' + year, 10);
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      if (monthNum < 1 || monthNum > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVV validation (3-4 digits)
    if (!cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const paymentDetails: PaymentDetails = {
      cardNumber: cardNumber.replace(/\s/g, ''),
      cardHolder: cardHolder.trim(),
      expiryDate,
      cvv,
      email: email.trim(),
    };

    await onPurchase(paymentDetails);
  };

  const handleClose = () => {
    // Reset form
    setCardNumber('');
    setCardHolder('');
    setExpiryDate('');
    setCvv('');
    setEmail('');
    setErrors({});
    onClose();
  };

  if (!pkg) return null;

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      animationType="slide"
      transparent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="card" size={28} color={colors.primary} />
                </View>
                <View>
                  <Text variant="headlineSmall" style={styles.title}>
                    Payment Details
                  </Text>
                  <Text variant="bodyMedium" style={styles.subtitle}>
                    Complete your purchase
                  </Text>
                </View>
              </View>
              <IconButton
                icon="close"
                size={24}
                onPress={handleClose}
                disabled={processing}
              />
            </View>

            {/* Package Summary */}
            <View style={styles.packageSummary}>
              <View style={styles.packageHeader}>
                <Text variant="titleMedium" style={styles.packageName}>
                  {pkg.name} Package
                </Text>
                {pkg.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}
              </View>
              <View style={styles.packageDetails}>
                <View style={styles.packageItem}>
                  <Ionicons name="diamond" size={18} color={colors.primary} />
                  <Text variant="bodyMedium" style={styles.packageText}>
                    {pkg.credits} Credits
                  </Text>
                </View>
                <View style={styles.packagePrice}>
                  <Text variant="headlineMedium" style={styles.priceValue}>
                    {pkg.currency} {pkg.price.toLocaleString()}
                  </Text>
                  {pkg.savings && (
                    <Text style={styles.savingsText}>Save {pkg.savings}</Text>
                  )}
                </View>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Payment Form */}
            <View style={styles.form}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Card Information
              </Text>

              {/* Card Number */}
              <View style={styles.inputGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Card Number *
                </Text>
                <TextInput
                  value={cardNumber}
                  onChangeText={handleCardNumberChange}
                  mode="outlined"
                  placeholder="1234 5678 9012 3456"
                  keyboardType="numeric"
                  style={styles.input}
                  outlineColor={errors.cardNumber ? colors.error : colors.border}
                  activeOutlineColor={errors.cardNumber ? colors.error : colors.primary}
                  error={!!errors.cardNumber}
                  disabled={processing}
                  left={<TextInput.Icon icon={() => <Ionicons name="card" size={20} color={colors.textSecondary} />} />}
                />
                {errors.cardNumber && (
                  <Text variant="bodySmall" style={styles.errorText}>
                    {errors.cardNumber}
                  </Text>
                )}
              </View>

              {/* Card Holder Name */}
              <View style={styles.inputGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Card Holder Name *
                </Text>
                <TextInput
                  value={cardHolder}
                  onChangeText={(text) => {
                    setCardHolder(text);
                    if (errors.cardHolder) setErrors({ ...errors, cardHolder: '' });
                  }}
                  mode="outlined"
                  placeholder="John Doe"
                  autoCapitalize="words"
                  style={styles.input}
                  outlineColor={errors.cardHolder ? colors.error : colors.border}
                  activeOutlineColor={errors.cardHolder ? colors.error : colors.primary}
                  error={!!errors.cardHolder}
                  disabled={processing}
                  left={<TextInput.Icon icon={() => <Ionicons name="person" size={20} color={colors.textSecondary} />} />}
                />
                {errors.cardHolder && (
                  <Text variant="bodySmall" style={styles.errorText}>
                    {errors.cardHolder}
                  </Text>
                )}
              </View>

              {/* Expiry Date and CVV */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text variant="labelLarge" style={styles.label}>
                    Expiry Date *
                  </Text>
                  <TextInput
                    value={expiryDate}
                    onChangeText={handleExpiryDateChange}
                    mode="outlined"
                    placeholder="MM/YY"
                    keyboardType="numeric"
                    style={styles.input}
                    outlineColor={errors.expiryDate ? colors.error : colors.border}
                    activeOutlineColor={errors.expiryDate ? colors.error : colors.primary}
                    error={!!errors.expiryDate}
                    disabled={processing}
                  />
                  {errors.expiryDate && (
                    <Text variant="bodySmall" style={styles.errorText}>
                      {errors.expiryDate}
                    </Text>
                  )}
                </View>

                <View style={[styles.inputGroup, styles.halfInput]}>
                  <Text variant="labelLarge" style={styles.label}>
                    CVV *
                  </Text>
                  <TextInput
                    value={cvv}
                    onChangeText={handleCvvChange}
                    mode="outlined"
                    placeholder="123"
                    keyboardType="numeric"
                    secureTextEntry
                    style={styles.input}
                    outlineColor={errors.cvv ? colors.error : colors.border}
                    activeOutlineColor={errors.cvv ? colors.error : colors.primary}
                    error={!!errors.cvv}
                    disabled={processing}
                  />
                  {errors.cvv && (
                    <Text variant="bodySmall" style={styles.errorText}>
                      {errors.cvv}
                    </Text>
                  )}
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Email Address *
                </Text>
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  mode="outlined"
                  placeholder="john.doe@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  outlineColor={errors.email ? colors.error : colors.border}
                  activeOutlineColor={errors.email ? colors.error : colors.primary}
                  error={!!errors.email}
                  disabled={processing}
                  left={<TextInput.Icon icon={() => <Ionicons name="mail" size={20} color={colors.textSecondary} />} />}
                />
                {errors.email && (
                  <Text variant="bodySmall" style={styles.errorText}>
                    {errors.email}
                  </Text>
                )}
                <Text variant="bodySmall" style={styles.helperText}>
                  Receipt will be sent to this email address
                </Text>
              </View>

              {/* Security Info */}
              <View style={styles.securityInfo}>
                <Ionicons name="shield-checkmark" size={18} color={colors.success} />
                <Text variant="bodySmall" style={styles.securityText}>
                  Your payment information is encrypted and secure
                </Text>
              </View>
            </View>

            {/* Purchase Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={processing}
              disabled={processing}
              style={styles.purchaseButton}
              buttonColor={colors.primary}
              textColor={colors.background}
              icon={() => processing ? null : <Ionicons name="checkmark-circle" size={20} color={colors.background} />}
            >
              {processing ? 'Processing Payment...' : `Purchase Package - ${pkg.currency} ${pkg.price.toLocaleString()}`}
            </Button>

            <View style={styles.footer}>
              <Text variant="bodySmall" style={styles.footerText}>
                By completing this purchase, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    marginTop: 60,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
  },
  packageSummary: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  packageName: {
    color: colors.text,
    fontWeight: '700',
  },
  popularBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  packageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  packageText: {
    color: colors.text,
    fontWeight: '600',
  },
  packagePrice: {
    alignItems: 'flex-end',
  },
  priceValue: {
    color: colors.text,
    fontWeight: '800',
  },
  savingsText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  form: {
    gap: spacing.lg,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.surface,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  errorText: {
    color: colors.error,
  },
  helperText: {
    color: colors.textSecondary,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: `${colors.success}10`,
    borderRadius: borderRadius.md,
  },
  securityText: {
    flex: 1,
    color: colors.text,
    fontWeight: '500',
  },
  purchaseButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  footer: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
