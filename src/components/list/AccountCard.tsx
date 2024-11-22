import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../common/Card';

interface AccountCardProps {
  name: string;
  balance: number;
  type: string;
  lastUpdated: Date;
  onPress?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  name,
  balance,
  type,
  lastUpdated,
  onPress,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card onPress={onPress} elevation={2}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.type}>{type}</Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.balance}>{formatCurrency(balance)}</Text>
      </View>
      <Text style={styles.lastUpdated}>Last updated: {formatDate(lastUpdated)}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  type: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  balanceContainer: {
    marginBottom: 12,
  },
  balance: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
