import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { formatCurrency } from '../../utils/currency';

const screenWidth = Dimensions.get("window").width;

interface CategoryData {
  name: string;
  amount: number;
  color: string;
}

interface CategoryBreakdownProps {
  data: CategoryData[];
  title?: string;
  height?: number;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  data,
  title,
  height = 220,
}) => {
  const chartData = data.map((item) => ({
    name: item.name,
    amount: item.amount,
    color: item.color,
    legendFontColor: '#6B7280',
    legendFontSize: 12,
  }));

  const formatAmount = (amount: number) => {
    return formatCurrency(amount);
  };

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Spending</Text>
        <Text style={styles.totalAmount}>{formatAmount(total)}</Text>
      </View>
      <PieChart
        data={chartData}
        width={screenWidth - 48} // Accounting for padding
        height={height}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="0"
        absolute
      />
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <View style={styles.legendText}>
              <Text style={styles.legendName}>{item.name}</Text>
              <Text style={styles.legendAmount}>
                {formatAmount(item.amount)}
                <Text style={styles.legendPercentage}>
                  {' '}
                  ({((item.amount / total) * 100).toFixed(1)}%)
                </Text>
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  legendContainer: {
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
  },
  legendName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  legendAmount: {
    fontSize: 12,
    color: '#6B7280',
  },
  legendPercentage: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
