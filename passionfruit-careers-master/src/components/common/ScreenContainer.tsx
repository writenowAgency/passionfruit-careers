import React from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  title?: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  noScroll?: boolean;
}

export const ScreenContainer: React.FC<Props> = ({
  title,
  children,
  onRefresh,
  refreshing,
  noScroll,
}) => {
  const content = (
    <View style={styles.content}>
      {title ? (
        <Text variant="headlineMedium" style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {noScroll ? (
        content
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            onRefresh ? (
              <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} colors={['#F4E04D']} />
            ) : undefined
          }
        >
          {content}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FAFAFA' },
  scrollContent: { flexGrow: 1 },
  content: { padding: 20, gap: 16 },
  title: { marginBottom: 4 },
});
