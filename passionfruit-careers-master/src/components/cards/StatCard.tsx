import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface Props {
  label: string;
  value: string;
  trend?: string;
}

export const StatCard: React.FC<Props> = ({ label, value, trend }) => (
  <Card style={styles.card}>
    <Card.Content>
      <Text variant="labelLarge" style={{ color: '#757575' }}>
        {label}
      </Text>
      <View style={styles.row}>
        <Text variant="displaySmall">{value}</Text>
        {trend ? <Text style={{ color: '#4CAF50' }}>{trend}</Text> : null}
      </View>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});
