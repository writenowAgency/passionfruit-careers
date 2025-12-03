import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { MatchScoreBadge } from '../common/MatchScoreBadge';
import type { Applicant } from '../../types';

interface Props {
  applicant: Applicant;
  onPress?: () => void;
}

export const ApplicantCard: React.FC<Props> = ({ applicant, onPress }) => (
  <Card style={styles.card} onPress={onPress} accessibilityRole="button">
    <Card.Content>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text variant="titleMedium">{applicant.name}</Text>
          <Text variant="bodySmall">{applicant.role}</Text>
        </View>
        <MatchScoreBadge score={applicant.matchScore} size="small" />
      </View>
      <View style={styles.chips}>
        <Chip icon="map-marker">{applicant.location}</Chip>
        <Chip icon="clock-time-four">{applicant.experience}</Chip>
        <Chip icon="check-circle">{applicant.status}</Chip>
      </View>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
