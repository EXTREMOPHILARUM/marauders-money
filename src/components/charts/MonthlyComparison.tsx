import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { formatCurrency, isZeroCurrency } from '../../utils/currency';

const screenWidth = Dimensions.get("window").width;

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface MonthlyComparisonProps {
  data: MonthlyData[];
  currency?: string;
}

const safeNumber = (value: number): number => {
  return isNaN(value) || !isFinite(value) ? 0 : value;
};

const safeCurrency = (value: number, currency?: string): string => {
  return formatCurrency(safeNumber(value), currency);
};

const safePercentage = (value: number): string => {
  const safeValue = safeNumber(value);
  return `${safeValue.toFixed(1)}%`;
};

export const MonthlyComparison: React.FC<MonthlyComparisonProps> = ({
  data,
  currency,
}) => {
  const safeData = data.map(item => ({
    month: item.month,
    income: safeNumber(item.income),
    expenses: safeNumber(item.expenses),
  }));

  const chartData = {
    labels: safeData.map((item) => item.month),
    datasets: [
      {
        data: safeData.map((item) => item.income),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
        label: 'Income',
      },
      {
        data: safeData.map((item) => item.expenses),
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red
        label: 'Expenses',
      },
    ],
    legend: ['Income', 'Expenses'],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
    propsForLabels: {
      fontSize: 12,
    },
    formatYLabel: (value: string) => {
      const numValue = parseFloat(value);
      return isNaN(numValue) || !isFinite(numValue) 
        ? formatCurrency(0, currency, true)
        : formatCurrency(numValue, currency, true);
    },
    yAxisLabel: currency ? currency + ' ' : '$ ', // Add currency symbol as y-axis label
    yAxisSuffix: '', // Optional: you can add a suffix if needed
  };

  const totalIncome = safeData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = safeData.reduce((sum, item) => sum + item.expenses, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Income vs Expenses</Text>
      
      <BarChart
        data={chartData}
        width={screenWidth - 48} // Reduced padding
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        showValuesOnTopOfBars
        fromZero
        withInnerLines={false}
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryValue, styles.incomeText]}>
              {safeCurrency(totalIncome, currency)}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
            <Text style={[styles.summaryValue, styles.expenseText]}>
              {safeCurrency(totalExpenses, currency)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net Savings</Text>
            <Text
              style={[
                styles.summaryValue,
                netSavings >= 0 ? styles.incomeText : styles.expenseText,
              ]}
            >
              {safeCurrency(netSavings, currency)}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Savings Rate</Text>
            <Text
              style={[
                styles.summaryValue,
                savingsRate >= 0 ? styles.incomeText : styles.expenseText,
              ]}
            >
              {safePercentage(savingsRate)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  summaryContainer: {
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    paddingHorizontal: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeText: {
    color: '#10B981',
  },
  expenseText: {
    color: '#EF4444',
  },
});
