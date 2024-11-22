import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useApp } from '../context/AppContext';

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

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-text">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Add Budget Button */}
        <TouchableOpacity className="m-4 bg-primary p-4 rounded-lg">
          <Text className="text-white text-center font-bold">Create New Budget</Text>
        </TouchableOpacity>

        {/* Monthly Overview */}
        <View className="px-4 mb-4">
          <Text className="text-xl font-bold text-text mb-2">Monthly Overview</Text>
          <View className="bg-surface rounded-lg p-4 shadow-sm">
            <View className="flex-row justify-between mb-2">
              <Text className="text-text">Total Budget</Text>
              <Text className="font-bold text-primary">$0.00</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-text">Remaining</Text>
              <Text className="font-bold text-success">$0.00</Text>
            </View>
          </View>
        </View>

        {/* Budget Categories */}
        <View className="px-4">
          <Text className="text-xl font-bold text-text mb-2">Budget Categories</Text>
          {budgets.length === 0 ? (
            <View className="bg-surface rounded-lg p-4 shadow-sm">
              <Text className="text-text text-center">No budgets set yet</Text>
            </View>
          ) : (
            budgets.map((budget) => (
              <TouchableOpacity
                key={budget.id}
                className="bg-surface rounded-lg p-4 shadow-sm mb-3"
              >
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-lg font-bold text-text">{budget.category}</Text>
                  <Text className="text-lg font-bold text-primary">
                    ${budget.amount.toFixed(2)}
                  </Text>
                </View>
                <View className="w-full h-2 bg-gray-200 rounded-full">
                  <View className="w-1/2 h-full bg-primary rounded-full" />
                </View>
                <Text className="text-sm text-text opacity-70 mt-2">
                  Period: {budget.period}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default BudgetScreen;
