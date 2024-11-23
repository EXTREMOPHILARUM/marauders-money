import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Budget {
  id: string;
  category: string;
  amount: number;
  period: string;
  startDate: number;
  endDate: number;
}

const BudgetScreen = () => {
  const { database, isLoading } = useApp();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchBudgets = async () => {
    if (!database) return;
    const allBudgets = await database.budgets.find().exec();
    setBudgets(allBudgets.map(budget => ({
      id: budget.id,
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
      startDate: budget.startDate,
      endDate: budget.endDate,
    })));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBudgets();
  }, [database]);

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-neutral-700">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: Platform.select({ ios: insets.bottom + 90, android: 90 })
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View className="px-4 pt-6 pb-4">
          <Text className="text-2xl font-bold text-neutral-900 mb-1">Budget</Text>
          <Text className="text-sm text-neutral-500">
            {budgets.length} {budgets.length === 1 ? 'category' : 'categories'} total
          </Text>
        </View>

        {/* Total Budget Overview Card */}
        <View className="mx-4 mb-6">
          <View className="bg-primary-600 rounded-2xl p-6 shadow-lg">
            <Text className="text-white/80 text-sm mb-2">Total Budget</Text>
            <Text className="text-white text-4xl font-bold">
              ${totalBudget.toFixed(2)}
            </Text>
            <View className="mt-4 flex-row items-center">
              <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white/90 text-sm">
                  Monthly Budget Overview
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Add Budget Button */}
        <TouchableOpacity 
          className="mx-4 mb-6 bg-primary-50 border-2 border-primary-600 border-dashed p-4 rounded-xl flex-row items-center justify-center"
        >
          <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
          <Text className="text-primary-600 font-semibold ml-2">Create New Budget</Text>
        </TouchableOpacity>

        {/* Budget Categories */}
        <View className="px-4 pb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-4">Budget Categories</Text>
          {budgets.length === 0 ? (
            <View className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
              <View className="items-center">
                <Ionicons name="pie-chart-outline" size={48} color="#94A3B8" />
                <Text className="text-neutral-500 text-center mt-4 text-base">
                  No budgets set yet
                </Text>
                <Text className="text-neutral-400 text-center mt-2 text-sm">
                  Create your first budget to start managing your expenses
                </Text>
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              {budgets.map((budget) => (
                <TouchableOpacity
                  key={budget.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-bold text-neutral-900">{budget.category}</Text>
                    <Text className="text-lg font-bold text-primary-600">
                      ${budget.amount.toFixed(2)}
                    </Text>
                  </View>
                  <View className="w-full h-2 bg-neutral-100 rounded-full">
                    <View className="w-1/2 h-full bg-primary-600 rounded-full" />
                  </View>
                  <Text className="text-sm text-neutral-500 mt-2">
                    Period: {budget.period}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default BudgetScreen;
