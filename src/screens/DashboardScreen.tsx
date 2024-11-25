import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionItem } from '../components/list/TransactionItem';
import { SimpleProgress } from '../components/common/SimpleProgress';
import { EmptyState } from '../components/common/EmptyState';
import { SummaryCard } from '../components/common/SummaryCard';
import { Card } from '../components/common/Card';
import { GoalCard } from '../components/list/GoalCard';
import { MonthlyComparison } from '../components/charts/MonthlyComparison';
import { CategoryBreakdown } from '../components/charts/CategoryBreakdown';
import { formatCurrency } from '../utils/currency';
import { Account } from '../types/account';

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

    // Prepare monthly comparison data from transactions
    const monthlyData = [];
    const now = new Date();
    for (let i = 2; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthIncome = transactions
        .filter(tx => tx.type === 'income' && tx.date >= month.getTime() && tx.date < nextMonth.getTime())
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const monthExpenses = transactions
        .filter(tx => tx.type === 'expense' && tx.date >= month.getTime() && tx.date < nextMonth.getTime())
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      monthlyData.push({
        month: month.toLocaleString('default', { month: 'short' }),
        income: monthIncome,
        expenses: monthExpenses
      });
    }

    // Prepare category breakdown data from transactions
    const categoryGroups = transactions
      .filter(tx => tx.type === 'expense' && tx.date > thirtyDaysAgo)
      .reduce((groups, tx) => {
        const category = tx.category || 'Other';
        if (!groups[category]) groups[category] = 0;
        groups[category] += tx.amount;
        return groups;
      }, {});
    
    const categoryData = Object.entries(categoryGroups)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

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

  const DashboardHeader: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
    <View className="px-4 pt-6 pb-4">
      <Text className="text-2xl font-bold text-neutral-900 mb-1">{title}</Text>
      <Text className="text-sm text-neutral-500">{subtitle}</Text>
    </View>
  );

  const NetWorthCard: React.FC<{ totalBalance: number; totalInvestments: number }> = ({ 
    totalBalance, 
    totalInvestments 
  }) => (
    <SummaryCard
      title="Total Net Worth"
      value={formatCurrency(totalBalance + totalInvestments)}
      colorScheme="primary"
      additionalInfo={{
        label: 'Balance',
        value: formatCurrency(totalBalance)
      }}
      type="investment"
      change={{
        value: totalInvestments,
        percentage: (totalInvestments / (totalBalance + totalInvestments)) * 100
      }}
    />
  );

  const MonthlyOverviewCard: React.FC<{ income: number; expenses: number }> = ({ 
    income, 
    expenses 
  }) => (
    <Card className="mx-4 mb-6">
      <Text className="text-xl font-bold text-neutral-900 mb-4">Monthly Overview</Text>
      <MonthlyComparison data={[
        { month: 'Income', income: income, expenses: 0 },
        { month: 'Expenses', income: 0, expenses: expenses }
      ]} />
    </Card>
  );

  const QuickActionGrid: React.FC<{ actions: Array<{ icon: string; label: string; onPress: () => void; color?: string }> }> = ({ 
    actions 
  }) => (
    <View className="px-4 mb-6">
      <Text className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</Text>
      <View className="flex-row space-x-4">
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100 flex-1"
            onPress={action.onPress}
          >
            <View className="items-center">
              <View className="bg-primary-50 p-3 rounded-lg mb-2">
                <Ionicons name={action.icon} size={24} color={action.color || "#2563EB"} />
              </View>
              <Text className="text-sm font-medium text-neutral-900 text-center">{action.label}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-lg text-neutral-700">Loading...</Text>
        </View>
      );
    }

    const quickActions = [
      {
        icon: 'wallet-outline',
        label: 'Add Account',
        onPress: () => navigation.navigate('Accounts')
      },
      {
        icon: 'pie-chart-outline',
        label: 'Add Budget',
        onPress: () => navigation.navigate('Budget')
      },
      {
        icon: 'trending-up-outline',
        label: 'Add Investment',
        onPress: () => navigation.navigate('Investments')
      }
    ];

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
        <DashboardHeader 
          title="Dashboard" 
          subtitle="Your financial overview" 
        />

        <NetWorthCard 
          totalBalance={summary.totalBalance}
          totalInvestments={summary.totalInvestments}
        />

        <MonthlyOverviewCard 
          income={summary.monthlyIncome}
          expenses={summary.monthlyExpenses}
        />

        {/* Category Summary */}
        <Card className="mx-4 mb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-4">Top Categories</Text>
          {summary.categoryData.length > 0 ? (
            <CategoryBreakdown
              data={summary.categoryData.map(cat => ({
                name: cat.category,
                amount: cat.amount,
                color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color for demo
              }))}
              height={200}
            />
          ) : (
            <EmptyState
              icon="pie-chart-outline"
              title="No Expenses Yet"
              description="Start tracking your expenses to see category insights"
            />
          )}
        </Card>

        <QuickActionGrid actions={quickActions} />

        {/* Active Goals */}
        <View className="px-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-neutral-900">Active Goals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text className="text-primary-600">See All</Text>
            </TouchableOpacity>
          </View>
          {summary.goals.length > 0 ? (
            summary.goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={{
                  ...goal,
                  progress: (goal.currentAmount / goal.targetAmount) * 100
                }}
                onPress={() => {}}
              />
            ))
          ) : (
            <EmptyState
              icon="flag-outline"
              title="No Active Goals"
              description="Set financial goals to track your progress"
            />
          )}
        </View>

        {/* Recent Activity */}
        <Card className="mx-4 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-neutral-900">Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text className="text-primary-600">See All</Text>
            </TouchableOpacity>
          </View>
          {summary.recentTransactions.length > 0 ? (
            summary.recentTransactions.map((transaction: any) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                showAccount={true}
              />
            ))
          ) : (
            <EmptyState
              icon="time-outline"
              title="No Recent Activity"
              description="Your recent transactions will appear here"
            />
          )}
        </Card>
      </ScrollView>
    );
  };

  return renderContent();
};

export default DashboardScreen;
