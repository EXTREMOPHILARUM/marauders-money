import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Summary {
  totalBalance: number;
  totalInvestments: number;
  activeBudgets: number;
  activeGoals: number;
  recentTransactions: any[];
}

type RootStackParamList = {
  Accounts: undefined;
  Budget: undefined;
  Investments: undefined;
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
    recentTransactions: [],
  });
  const insets = useSafeAreaInsets();

  useEffect(() => {
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
      
      // Fetch active goals count
      const goals = await database.goals.find().exec();

      // Update summary
      setSummary({
        totalBalance,
        totalInvestments,
        activeBudgets: budgets.length,
        activeGoals: goals.length,
        recentTransactions: [], // To be implemented
      });
    };

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
              ${(summary.totalBalance + summary.totalInvestments).toFixed(2)}
            </Text>
            <View className="mt-4 flex-row items-center space-x-2">
              <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white/90 text-sm">
                  Balance: ${summary.totalBalance.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white/90 text-sm">
                  Investments: ${summary.totalInvestments.toFixed(2)}
                </Text>
              </View>
            </View>
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

        {/* Statistics Overview */}
        <View className="px-4 mb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-4">Statistics</Text>
          <View className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <View className="bg-primary-50 p-2 rounded-lg mr-3">
                  <Ionicons name="stats-chart-outline" size={24} color="#2563EB" />
                </View>
                <View>
                  <Text className="text-neutral-900 font-medium">Active Tracking</Text>
                  <Text className="text-neutral-500 text-sm">Current monitoring status</Text>
                </View>
              </View>
            </View>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-neutral-900">{summary.activeBudgets}</Text>
                <Text className="text-neutral-500 text-sm">Budgets</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-neutral-900">{summary.activeGoals}</Text>
                <Text className="text-neutral-500 text-sm">Goals</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-neutral-900">
                  {summary.recentTransactions.length}
                </Text>
                <Text className="text-neutral-500 text-sm">Transactions</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-4 pb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-4">Recent Activity</Text>
          <View className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
            <View className="items-center">
              <Ionicons name="time-outline" size={48} color="#94A3B8" />
              <Text className="text-neutral-500 text-center mt-4 text-base">
                No recent activity
              </Text>
              <Text className="text-neutral-400 text-center mt-2 text-sm">
                Your recent financial activities will appear here
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View className="flex-1 bg-background">
      {renderContent()}
    </View>
  );
};

export default DashboardScreen;
