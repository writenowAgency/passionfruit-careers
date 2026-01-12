import React, { useState } from 'react';
import { Modal, View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Chip, Divider } from 'react-native-paper';
import { colors, spacing } from '@/theme';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';

// Filter values that match the database schema
const JOB_TYPES = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Internship', value: 'internship' },
];

const EXP_LEVELS = [
  { label: 'Junior', value: 'junior' },
  { label: 'Mid-level', value: 'mid' },
  { label: 'Senior', value: 'senior' },
  { label: 'Lead', value: 'lead' },
];

const DATE_POSTED = ['Anytime', 'Past 24 hours', 'Past week', 'Past month'];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  applyFilters: (filters: any) => void;
  currentFilters: {
    jobType: string | null;
    experienceLevel: string | null;
    datePosted: string | null;
  };
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, applyFilters, currentFilters }) => {
  const [jobType, setJobType] = useState(currentFilters.jobType);
  const [expLevel, setExpLevel] = useState(currentFilters.experienceLevel);
  const [datePosted, setDatePosted] = useState(currentFilters.datePosted);
  const responsive = useResponsiveStyles();

  const handleApply = () => {
    applyFilters({
      jobType,
      experienceLevel: expLevel,
      datePosted,
    });
    onClose();
  };

  const handleClear = () => {
    setJobType(null);
    setExpLevel(null);
    setDatePosted(null);
    applyFilters({
      jobType: null,
      experienceLevel: null,
      datePosted: null,
    });
    onClose();
  };

  const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.chipsContainer, { gap: responsive.spacing(spacing.sm) }]}>{children}</View>
      <Divider style={styles.divider} />
    </View>
  );

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filters</Text>
          <Button onPress={onClose}>Close</Button>
        </View>
        <ScrollView>
          <FilterSection title="Job Type">
            {JOB_TYPES.map(type => (
              <Chip
                key={type.value}
                selected={jobType === type.value}
                onPress={() => setJobType(jobType === type.value ? null : type.value)}
              >
                {type.label}
              </Chip>
            ))}
          </FilterSection>

          <FilterSection title="Experience Level">
            {EXP_LEVELS.map(level => (
              <Chip
                key={level.value}
                selected={expLevel === level.value}
                onPress={() => setExpLevel(expLevel === level.value ? null : level.value)}
              >
                {level.label}
              </Chip>
            ))}
          </FilterSection>

          <FilterSection title="Date Posted">
            {DATE_POSTED.map(date => (
              <Chip
                key={date}
                selected={datePosted === date}
                onPress={() => setDatePosted(datePosted === date ? null : date)}
              >
                {date}
              </Chip>
            ))}
          </FilterSection>
        </ScrollView>
        <View style={[styles.footer, { padding: responsive.padding(spacing.md) }]}>
          <Button onPress={handleClear} style={{ flex: 1, marginRight: responsive.spacing(spacing.sm) }}>Clear</Button>
          <Button mode="contained" onPress={handleApply} style={{ flex: 2 }}>Apply Filters</Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  divider: {
    marginTop: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});
