import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Pressable, Linking } from 'react-native';
import { Text, Card, TextInput, Button, Snackbar, Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '@/theme';
import { FadeIn } from '@/components/animations/FadeIn';
import { ScaleUp } from '@/components/animations/ScaleUp';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpSupportScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const faqs: FAQItem[] = [
    {
      id: '1',
      category: 'Getting Started',
      question: 'How do I post my first job?',
      answer: 'To post your first job, navigate to the Jobs tab and click "Post New Job". Fill in the job details including title, description, requirements, and other relevant information. Once submitted, your job will be visible to job seekers on the platform.',
    },
    {
      id: '2',
      category: 'Getting Started',
      question: 'What are credits and how do they work?',
      answer: 'Credits are used to post jobs and access premium features. Each job posting typically requires credits. You can purchase credits from the Credits & Billing section. Your current credit balance is always visible on your dashboard.',
    },
    {
      id: '3',
      category: 'Applications',
      question: 'How do I review applications?',
      answer: 'Go to the Applicants tab to see all applications. You can filter by status (pending, reviewed, shortlisted). Click on any applicant to view their full profile, resume, and application details. Use the action buttons to mark applications as reviewed, shortlisted, or schedule interviews.',
    },
    {
      id: '4',
      category: 'Applications',
      question: 'Can I export applicant data?',
      answer: 'Yes! Go to the Applicants section and use the Export feature to download applicant information in CSV or Excel format. You can filter the data before exporting.',
    },
    {
      id: '5',
      category: 'Billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and bank transfers. All payments are processed securely through our payment gateway.',
    },
    {
      id: '6',
      category: 'Billing',
      question: 'Can I get a refund for unused credits?',
      answer: 'Credits are non-refundable but they never expire. You can use them whenever you need to post jobs in the future.',
    },
    {
      id: '7',
      category: 'Account',
      question: 'How do I add team members?',
      answer: 'Navigate to Profile > Team Members to invite colleagues to your account. You can set different permission levels for each team member to control what they can access.',
    },
    {
      id: '8',
      category: 'Account',
      question: 'How do I change my password?',
      answer: 'Go to Profile > Security & Password to change your password. You\'ll need to enter your current password and then choose a new secure password.',
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  const handleSendMessage = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      setSnackbarMessage('Please fill in all fields');
      setSnackbarVisible(true);
      return;
    }

    setSending(true);
    try {
      // TODO: Implement API call to send support message
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSnackbarMessage('Message sent successfully! We\'ll get back to you soon.');
      setSnackbarVisible(true);
      setContactForm({ subject: '', message: '' });
    } catch (error) {
      setSnackbarMessage('Failed to send message. Please try again.');
      setSnackbarVisible(true);
    } finally {
      setSending(false);
    }
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@passionfruitcareers.com?subject=Support Request');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+27112345678');
  };

  const handleOpenDocs = () => {
    Linking.openURL('https://docs.passionfruitcareers.com');
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn delay={0}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="help-circle" size={32} color={colors.info} />
            </View>
            <View style={styles.headerText}>
              <Text variant="headlineSmall" style={styles.title}>
                Help & Support
              </Text>
              <Text variant="bodyMedium" style={styles.subtitle}>
                Get answers to your questions or reach out to our team
              </Text>
            </View>
          </View>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={50}>
          <View style={styles.quickActions}>
            <Pressable style={styles.quickActionCard} onPress={handleEmailSupport}>
              <Ionicons name="mail" size={28} color={colors.primary} />
              <Text variant="labelLarge" style={styles.quickActionText}>
                Email Us
              </Text>
            </Pressable>
            <Pressable style={styles.quickActionCard} onPress={handleCallSupport}>
              <Ionicons name="call" size={28} color={colors.success} />
              <Text variant="labelLarge" style={styles.quickActionText}>
                Call Support
              </Text>
            </Pressable>
            <Pressable style={styles.quickActionCard} onPress={handleOpenDocs}>
              <Ionicons name="book" size={28} color={colors.secondary} />
              <Text variant="labelLarge" style={styles.quickActionText}>
                Documentation
              </Text>
            </Pressable>
          </View>
        </FadeIn>

        {/* FAQ Search */}
        <FadeIn delay={100}>
          <Searchbar
            placeholder="Search FAQs..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={colors.primary}
          />
        </FadeIn>

        {/* FAQs */}
        <FadeIn delay={150}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Frequently Asked Questions
              </Text>

              {Object.entries(groupedFAQs).map(([category, items], categoryIndex) => (
                <View key={category} style={styles.faqCategory}>
                  <Text variant="titleMedium" style={styles.categoryTitle}>
                    {category}
                  </Text>
                  {items.map((faq, index) => (
                    <ScaleUp key={faq.id} delay={categoryIndex * 50 + index * 20}>
                      <Pressable
                        style={styles.faqItem}
                        onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      >
                        <View style={styles.faqHeader}>
                          <Text variant="bodyLarge" style={styles.faqQuestion}>
                            {faq.question}
                          </Text>
                          <Ionicons
                            name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={colors.primary}
                          />
                        </View>
                        {expandedFAQ === faq.id && (
                          <Text variant="bodyMedium" style={styles.faqAnswer}>
                            {faq.answer}
                          </Text>
                        )}
                      </Pressable>
                    </ScaleUp>
                  ))}
                </View>
              ))}

              {filteredFAQs.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
                  <Text variant="bodyLarge" style={styles.emptyText}>
                    No FAQs found
                  </Text>
                  <Text variant="bodySmall" style={styles.emptySubtext}>
                    Try a different search term
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>
        </FadeIn>

        {/* Contact Form */}
        <FadeIn delay={200}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Still Need Help?
              </Text>
              <Text variant="bodyMedium" style={styles.sectionSubtitle}>
                Send us a message and we'll get back to you as soon as possible
              </Text>

              <View style={styles.formGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Subject
                </Text>
                <TextInput
                  value={contactForm.subject}
                  onChangeText={(text) => setContactForm({ ...contactForm, subject: text })}
                  mode="outlined"
                  placeholder="What do you need help with?"
                  style={styles.input}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text variant="labelLarge" style={styles.label}>
                  Message
                </Text>
                <TextInput
                  value={contactForm.message}
                  onChangeText={(text) => setContactForm({ ...contactForm, message: text })}
                  mode="outlined"
                  placeholder="Describe your issue or question..."
                  style={[styles.input, styles.textArea]}
                  outlineColor={colors.border}
                  activeOutlineColor={colors.primary}
                  multiline
                  numberOfLines={6}
                />
              </View>

              <Button
                mode="contained"
                onPress={handleSendMessage}
                loading={sending}
                disabled={sending}
                style={styles.sendButton}
                buttonColor={colors.primary}
                textColor={colors.background}
                icon={() => <Ionicons name="send" size={18} color={colors.background} />}
              >
                Send Message
              </Button>
            </Card.Content>
          </Card>
        </FadeIn>

        {/* Contact Information */}
        <FadeIn delay={250}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Contact Information
              </Text>
              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Ionicons name="mail" size={20} color={colors.primary} />
                  <Text variant="bodyMedium" style={styles.contactText}>
                    support@passionfruitcareers.com
                  </Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="call" size={20} color={colors.primary} />
                  <Text variant="bodyMedium" style={styles.contactText}>
                    +27 11 234 5678
                  </Text>
                </View>
                <View style={styles.contactItem}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                  <Text variant="bodyMedium" style={styles.contactText}>
                    Monday - Friday, 9:00 AM - 5:00 PM SAST
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </FadeIn>
      </ScrollView>

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
    paddingBottom: spacing.xxl,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: `${colors.info}15`,
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
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  quickActionText: {
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchBar: {
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
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
  sectionSubtitle: {
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  faqCategory: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  faqItem: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  faqQuestion: {
    flex: 1,
    color: colors.text,
    fontWeight: '600',
  },
  faqAnswer: {
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  emptySubtext: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
  },
  textArea: {
    minHeight: 120,
  },
  sendButton: {
    marginTop: spacing.sm,
  },
  contactInfo: {
    gap: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactText: {
    color: colors.text,
  },
});

export default HelpSupportScreen;
