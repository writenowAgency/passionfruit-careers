import React from 'react';
import { Card, Text } from 'react-native-paper';

interface Props {
  title: string;
  message: string;
  timestamp: string;
}

export const NotificationCard: React.FC<Props> = ({ title, message, timestamp }) => (
  <Card style={{ marginBottom: 12, borderRadius: 16 }}>
    <Card.Title title={title} subtitle={timestamp} />
    <Card.Content>
      <Text>{message}</Text>
    </Card.Content>
  </Card>
);
