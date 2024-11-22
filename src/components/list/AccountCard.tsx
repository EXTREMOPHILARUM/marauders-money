import React from 'react';
import { Text, View } from 'react-native';
import { Card } from '../common/Card';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution?: string;
  notes?: string;
  lastUpdated: number;
}

interface AccountCardProps {
  account: Account;
  onPress?: () => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account: { name, balance, type, lastUpdated, currency },
  onPress,
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card onPress={onPress} elevation={2}>
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-800">{name}</Text>
        <Text className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded capitalize">{type}</Text>
      </View>
      <View className="mb-3">
        <Text className="text-2xl font-bold text-gray-800">{formatCurrency(balance)}</Text>
      </View>
      <Text className="text-xs text-gray-400">Last updated: {formatDate(lastUpdated)}</Text>
    </Card>
  );
};
