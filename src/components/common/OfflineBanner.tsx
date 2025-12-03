import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  visible: boolean;
}

export const OfflineBanner: React.FC<Props> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text variant="bodySmall" style={{ color: '#1A1A1A' }}>
        You are offline. Some actions are cached until you reconnect.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF59D',
    padding: 8,
    alignItems: 'center',
  },
});
