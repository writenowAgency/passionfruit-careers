import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/theme';

export interface Transaction {
  id: string;
  type: 'purchase' | 'usage' | 'refund';
  description: string;
  amount: number;
  timestamp: string;
  details?: string;
}

interface TransactionItemProps {
  transaction: Transaction;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const getTransactionIcon = () => {
    switch (transaction.type) {
      case 'purchase':
        return 'add-circle';
      case 'usage':
        return 'remove-circle';
      case 'refund':
        return 'refresh-circle';
      default:
        return 'ellipse';
    }
  };

  const getTransactionColor = () => {
    switch (transaction.type) {
      case 'purchase':
        return colors.success;
      case 'usage':
        return colors.info;
      case 'refund':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getAmountPrefix = () => {
    switch (transaction.type) {
      case 'purchase':
      case 'refund':
        return '+';
      case 'usage':
        return '-';
      default:
        return '';
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const iconColor = getTransactionColor();

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={getTransactionIcon()} size={24} color={iconColor} />
      </View>

      <View style={styles.content}>
        <Text variant="titleSmall" style={styles.description}>
          {transaction.description}
        </Text>
        {transaction.details && (
          <Text variant="bodySmall" style={styles.details}>
            {transaction.details}
          </Text>
        )}
        <Text variant="bodySmall" style={styles.timestamp}>
          {formatTimestamp(transaction.timestamp)}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          variant="titleMedium"
          style={[
            styles.amount,
            { color: transaction.type === 'usage' ? colors.textSecondary : iconColor },
          ]}
        >
          {getAmountPrefix()}
          {Math.abs(transaction.amount)}
        </Text>
        <Text variant="bodySmall" style={styles.creditsLabel}>
          credits
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  description: {
    color: colors.text,
    fontWeight: '600',
  },
  details: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: 11,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '800',
  },
  creditsLabel: {
    color: colors.textSecondary,
    fontSize: 11,
  },
});
