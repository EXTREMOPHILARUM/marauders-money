import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { formatCurrency } from '../../utils/formatters';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface MonthlyComparisonProps {
  data: MonthlyData[];
  currency?: string;
}

export const MonthlyComparison: React.FC<MonthlyComparisonProps> = ({
  data,
  currency = 'USD',
}) => {
  const chartData = {
    labels: data.map((item) => item.month),
    datasets: [
      {
        data: data.map((item) => item.income),
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green
        label: 'Income',
      },
      {
        data: data.map((item) => item.expenses),
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
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#fafafa',
    },
    formatYLabel: (value: string) => formatCurrency(parseFloat(value), currency, true),
  };

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = (netSavings / totalIncome) * 100;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monthly Income vs Expenses</Text>
      
      <BarChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        showBarTops={false}
        fromZero
        withInnerLines={true}
        segments={5}
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={[styles.summaryValue, styles.incomeText]}>
            {formatCurrency(totalIncome, currency)}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={[styles.summaryValue, styles.expenseText]}>
            {formatCurrency(totalExpenses, currency)}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net Savings</Text>
          <Text
            style={[
              styles.summaryValue,
              netSavings >= 0 ? styles.incomeText : styles.expenseText,
            ]}
          >
            {formatCurrency(netSavings, currency)}
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
            {savingsRate.toFixed(1)}%
          </Text>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  summaryContainer: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
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
