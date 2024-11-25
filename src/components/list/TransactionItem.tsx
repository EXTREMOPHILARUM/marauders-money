import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';

interface TransactionItemProps {
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  amount,
  description,
  category,
  date,
  type,
  onPress,
}) => {
  return (
    <Card onPress={onPress} elevation={1}>
      <View style={styles.container}>
        <View style={styles.leftContent}>
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
          <Text style={styles.category}>{category}</Text>
        </View>
        <View style={styles.rightContent}>
          <Text
            style={[
              styles.amount,
              { color: type === 'income' ? styles.colors.success : styles.colors.danger },
            ]}
          >
            {type === 'income' ? '+' : '-'} {formatCurrency(amount)}
          </Text>
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
    marginRight: 16,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#6B7280',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
  },
  colors: {
    success: '#059669',
    danger: '#DC2626',
  },
});
