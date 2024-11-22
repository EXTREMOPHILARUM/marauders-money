import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useApp } from '../context/AppContext';
import { MonthlyComparison } from '../components/charts/MonthlyComparison';
import { CategoryBreakdown } from '../components/charts/CategoryBreakdown';
import { SpendingChart } from '../components/charts/SpendingChart';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: number;
}

const AnalyticsScreen = () => {
  const { database, isLoading } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    if (!database) return;
    const allTransactions = await database.transactions.find().exec();
    setTransactions(allTransactions.map(tx => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      date: tx.date,
    })));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [database]);

  const getMonthlyData = () => {
    const monthlyData = new Map<string, { income: number; expenses: number }>();
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      if (tx.type === 'income') {
        data.income += tx.amount;
      } else {
        data.expenses += tx.amount;
      }
    });

    // Get last 6 months
    return Array.from(monthlyData.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .reverse()
      .map(([month, data]) => ({
        month: month.split('-')[1],
        ...data,
      }));
  };

  const getCategoryData = () => {
    const categoryData = new Map<string, number>();
    
    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        categoryData.set(
          tx.category,
          (categoryData.get(tx.category) || 0) + tx.amount
        );
      });

    return Array.from(categoryData.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));
  };

  const getSpendingData = () => {
    const dailyData = new Map<string, number>();
    
    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        dailyData.set(date, (dailyData.get(date) || 0) + tx.amount);
      });

    return Array.from(dailyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, amount]) => ({
        date,
        amount,
      }));
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-text">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="p-4">
        <Text className="text-2xl font-bold text-text mb-4">Financial Analytics</Text>

        {/* Monthly Income vs Expenses */}
        <View className="mb-6">
          <MonthlyComparison data={getMonthlyData()} />
        </View>

        {/* Category Breakdown */}
        <View className="mb-6">
          <CategoryBreakdown data={getCategoryData()} />
        </View>

        {/* Daily Spending Trend */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text mb-2">Daily Spending Trend</Text>
          <SpendingChart data={getSpendingData()} />
        </View>
      </View>
    </ScrollView>
  );
};

export default AnalyticsScreen;
