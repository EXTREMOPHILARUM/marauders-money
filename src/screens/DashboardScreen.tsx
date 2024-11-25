import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionItem } from '../components/list/TransactionItem';
import { SimpleProgress } from '../components/common/SimpleProgress';
import { formatCurrency } from '../utils/formatters';

interface Summary {
  totalBalance: number;
  totalInvestments: number;
  activeBudgets: number;
  activeGoals: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  recentTransactions: any[];
  goals: Array<{
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
    category: string;
  }>;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
  }>;
  categoryData: Array<{
    category: string;
    amount: number;
  }>;
}

type RootStackParamList = {
  Accounts: undefined;
  Budget: undefined;
  Investments: undefined;
  Goals: undefined;
};

const DashboardScreen = () => {
  const { database, isLoading } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<Summary>({
    totalBalance: 0,
    totalInvestments: 0,
    activeBudgets: 0,
    activeGoals: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    recentTransactions: [],
    goals: [],
    monthlyData: [],
    categoryData: [],
  });
  const insets = useSafeAreaInsets();

  const fetchSummary = async () => {
    if (!database) return;

    // Fetch accounts total
    const accounts = await database.accounts.find().exec();
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Fetch investments total
    const investments = await database.investments.find().exec();
    const totalInvestments = investments.reduce((sum, inv) => 
      sum + (inv.currentPrice * inv.quantity), 0);

    // Fetch active budgets count
    const budgets = await database.budgets.find().exec();
    
    // Fetch active goals
    const goals = await database.goals.find().exec();
    const goalsData = goals.map(goal => ({
      id: goal.id,
      name: goal.name,
      currentAmount: goal.currentAmount || 0,
      targetAmount: goal.targetAmount,
      category: goal.category,
    }));

    // Fetch recent transactions
    const transactions = await database.transactions.find().exec();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentTransactions = transactions
      .filter(tx => tx.date > thirtyDaysAgo)
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);

    // Calculate monthly totals
    const monthlyIncome = transactions
      .filter(tx => tx.type === 'income' && tx.date > thirtyDaysAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const monthlyExpenses = transactions
      .filter(tx => tx.type === 'expense' && tx.date > thirtyDaysAgo)
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Prepare monthly comparison data (mock data for now)
    const monthlyData = [
      { month: 'Jan', income: 5000, expenses: 3500 },
      { month: 'Feb', income: 5200, expenses: 3800 },
      { month: 'Mar', income: 4800, expenses: 3300 },
    ];

    // Prepare category breakdown data
    const categoryData = [
      { category: 'Food', amount: 500 },
      { category: 'Transport', amount: 300 },
      { category: 'Shopping', amount: 400 },
    ];

    // Update summary
    setSummary({
      totalBalance,
      totalInvestments,
      activeBudgets: budgets.length,
      activeGoals: goals.length,
      monthlyIncome,
      monthlyExpenses,
      recentTransactions,
      goals: goalsData,
      monthlyData,
      categoryData,
    });
  };

  useEffect(() => {
    fetchSummary();
  }, [database]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  };

  const QuickAction = ({ icon, label, onPress, color = "#2563EB" }) => (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 flex-1"
      onPress={onPress}
    >
      <View className="items-center">
        <View className={`bg-primary-50 p-3 rounded-lg mb-2`}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text className="text-sm font-medium text-neutral-900 text-center">{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-lg text-neutral-700">Loading...</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        className="flex-1 bg-background"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingBottom: Platform.select({ ios: insets.bottom + 90, android: 90 })
        }}
      >
        {/* Header Section */}
        <View className="px-4 pt-6 pb-4">
          <Text className="text-2xl font-bold text-neutral-900 mb-1">Dashboard</Text>
          <Text className="text-sm text-neutral-500">
            Your financial overview
          </Text>
        </View>

        {/* Total Balance Card */}
        <View className="mx-4 mb-6">
          <View className="bg-primary-600 rounded-2xl p-6 shadow-lg">
            <Text className="text-white/80 text-sm mb-2">Total Net Worth</Text>
            <Text className="text-white text-4xl font-bold">
              {formatCurrency(summary.totalBalance + summary.totalInvestments)}
            </Text>
            <View className="mt-4 flex-row items-center space-x-2">
              <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white/90 text-sm">
                  Balance: {formatCurrency(summary.totalBalance)}
                </Text>
              </View>
              <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white/90 text-sm">
                  Investments: {formatCurrency(summary.totalInvestments)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Monthly Overview */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-4">Monthly Overview</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-neutral-500">Income</Text>
                <Text className="text-lg font-semibold text-neutral-900">
                  {formatCurrency(summary.monthlyIncome)}
                </Text>
              </View>
              <View>
                <Text className="text-neutral-500">Expenses</Text>
                <Text className="text-lg font-semibold text-neutral-900">
                  {formatCurrency(summary.monthlyExpenses)}
                </Text>
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-neutral-500">
                Net: {formatCurrency(summary.monthlyIncome - summary.monthlyExpenses)}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Summary */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-4">Top Categories</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            {summary.categoryData.slice(0, 3).map((category, index) => (
              <View key={index} className="mb-2 last:mb-0">
                <View className="flex-row justify-between items-center">
                  <Text className="text-neutral-900">{category.category}</Text>
                  <Text className="text-neutral-500">{formatCurrency(category.amount)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</Text>
          <View className="flex-row space-x-4">
            <QuickAction
              icon="wallet-outline"
              label="Add Account"
              onPress={() => navigation.navigate('Accounts')}
            />
            <QuickAction
              icon="pie-chart-outline"
              label="Add Budget"
              onPress={() => navigation.navigate('Budget')}
            />
            <QuickAction
              icon="trending-up-outline"
              label="Add Investment"
              onPress={() => navigation.navigate('Investments')}
            />
          </View>
        </View>

        {/* Active Goals */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-neutral-900">Active Goals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text className="text-primary-600">See All</Text>
            </TouchableOpacity>
          </View>
          {summary.goals.map(goal => (
            <View key={goal.id} className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 mb-3">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-medium text-neutral-900">{goal.name}</Text>
                <Text className="text-neutral-500">
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </Text>
              </View>
              <SimpleProgress 
                current={goal.currentAmount}
                target={goal.targetAmount}
                color={
                  goal.category === 'savings' ? '#10B981' : 
                  goal.category === 'debt' ? '#EF4444' : 
                  goal.category === 'investment' ? '#3B82F6' : '#8B5CF6'
                }
              />
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <View className="px-4 pb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-neutral-900">Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text className="text-primary-600">See All</Text>
            </TouchableOpacity>
          </View>
          <View className="bg-white rounded-xl shadow-sm border border-neutral-100">
            {summary.recentTransactions.length > 0 ? (
              summary.recentTransactions.map((transaction: any) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  showAccount={true}
                />
              ))
            ) : (
              <View className="items-center py-8">
                <Ionicons name="time-outline" size={48} color="#94A3B8" />
                <Text className="text-neutral-500 text-center mt-4 text-base">
                  No recent activity
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    );
  };

  return renderContent();
};

export default DashboardScreen;
