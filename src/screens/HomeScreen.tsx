import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { MonthlyComparison } from '../components/charts/MonthlyComparison';
import { CategoryBreakdown } from '../components/charts/CategoryBreakdown';
import { AccountCard } from '../components/list/AccountCard';
import { TransactionItem } from '../components/list/TransactionItem';
import { ProgressBar } from '../components/charts/ProgressBar';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  lastUpdated: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: number;
  accountId: string;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: number;
  category: string;
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const { database, isLoading } = useApp();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!database) return;
    
    // Fetch accounts
    const allAccounts = await database.accounts.find().exec();
    setAccounts(allAccounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: acc.balance,
      currency: acc.currency,
      lastUpdated: acc.lastUpdated || Date.now(),
    })));

    // Fetch transactions
    const allTransactions = await database.transactions.find().exec();
    setTransactions(allTransactions.map(tx => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      description: tx.description,
      date: tx.date,
      accountId: tx.accountId,
    })));

    // Fetch goals
    const allGoals = await database.goals.find().exec();
    setGoals(allGoals.map(goal => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount || 0,
      deadline: goal.deadline,
      category: goal.category,
    })));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, [database]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const monthlyIncome = transactions
    .filter(tx => tx.type === 'income' && tx.date > Date.now() - 30 * 24 * 60 * 60 * 1000)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const monthlyExpenses = transactions
    .filter(tx => tx.type === 'expense' && tx.date > Date.now() - 30 * 24 * 60 * 60 * 1000)
    .reduce((sum, tx) => sum + tx.amount, 0);

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
      {/* Overview Cards */}
      <View className="p-4">
        {/* Total Balance */}
        <View className="bg-primary rounded-lg p-6 mb-4">
          <Text className="text-white text-sm mb-1">Total Balance</Text>
          <Text className="text-white text-3xl font-bold">
            ${totalBalance.toFixed(2)}
          </Text>
        </View>

        {/* Monthly Summary */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-surface rounded-lg p-4 flex-1 mr-2">
            <Text className="text-text text-sm mb-1">Monthly Income</Text>
            <Text className="text-success text-xl font-bold">
              ${monthlyIncome.toFixed(2)}
            </Text>
          </View>
          <View className="bg-surface rounded-lg p-4 flex-1 ml-2">
            <Text className="text-text text-sm mb-1">Monthly Expenses</Text>
            <Text className="text-danger text-xl font-bold">
              ${monthlyExpenses.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Monthly Comparison */}
      <View className="px-4 mb-6">
        <MonthlyComparison
          data={[
            { month: 'Jan', income: 5000, expenses: 3500 },
            { month: 'Feb', income: 5200, expenses: 3800 },
            { month: 'Mar', income: 4800, expenses: 3300 },
          ]}
        />
      </View>

      {/* Category Breakdown */}
      <View className="px-4 mb-6">
        <CategoryBreakdown
          data={[
            { category: 'Food', amount: 500 },
            { category: 'Transport', amount: 300 },
            { category: 'Shopping', amount: 400 },
          ]}
        />
      </View>

      {/* Active Goals */}
      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-text">Active Goals</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
            <Text className="text-primary">See All</Text>
          </TouchableOpacity>
        </View>
        {goals.slice(0, 2).map(goal => {
          return (
            <View key={goal.id} className="bg-surface rounded-lg p-4 mb-3">
              <View className="flex-row justify-between mb-2">
                <Text className="font-bold text-text">{goal.name}</Text>
                <Text className="text-text">
                  ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                </Text>
              </View>
              <ProgressBar 
                current={goal.currentAmount}
                target={goal.targetAmount}
                color={goal.category === 'savings' ? '#10B981' : 
                       goal.category === 'debt' ? '#EF4444' : 
                       goal.category === 'investment' ? '#3B82F6' : '#8B5CF6'}
                showAmount={false}
              />
            </View>
          );
        })}
      </View>

      {/* Recent Accounts */}
      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-text">Your Accounts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Accounts')}>
            <Text className="text-primary">See All</Text>
          </TouchableOpacity>
        </View>
        {accounts.slice(0, 3).map(account => (
          <AccountCard
            key={account.id}
            account={account}
            onPress={() => {/* Handle account press */}}
          />
        ))}
      </View>

      {/* Recent Transactions */}
      <View className="px-4 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-text">Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text className="text-primary">See All</Text>
          </TouchableOpacity>
        </View>
        {transactions
          .sort((a, b) => b.date - a.date)
          .slice(0, 5)
          .map(transaction => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              accountName={accounts.find(acc => acc.id === transaction.accountId)?.name}
              onPress={() => {/* Handle transaction press */}}
            />
          ))}
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
