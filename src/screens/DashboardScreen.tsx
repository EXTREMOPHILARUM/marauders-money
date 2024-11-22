import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';

const DashboardScreen = () => {
  const { database, isLoading } = useApp();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-text">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Account Summary Section */}
      <View className="p-4">
        <Text className="text-xl font-bold text-text mb-4">Account Summary</Text>
        <View className="bg-surface rounded-lg p-4 shadow-sm">
          <Text className="text-lg text-text">Total Balance</Text>
          <Text className="text-2xl font-bold text-primary">$0.00</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="p-4">
        <Text className="text-xl font-bold text-text mb-4">Quick Actions</Text>
        <View className="flex-row flex-wrap gap-2">
          <TouchableOpacity className="bg-primary p-4 rounded-lg flex-1">
            <Text className="text-white text-center">Add Transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-secondary p-4 rounded-lg flex-1">
            <Text className="text-white text-center">Add Account</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions */}
      <View className="p-4">
        <Text className="text-xl font-bold text-text mb-4">Recent Transactions</Text>
        <View className="bg-surface rounded-lg p-4 shadow-sm">
          <Text className="text-text text-center">No recent transactions</Text>
        </View>
      </View>

      {/* Budget Overview */}
      <View className="p-4">
        <Text className="text-xl font-bold text-text mb-4">Budget Overview</Text>
        <View className="bg-surface rounded-lg p-4 shadow-sm">
          <Text className="text-text text-center">No budgets set</Text>
        </View>
      </View>

      {/* Investment Summary */}
      <View className="p-4 mb-4">
        <Text className="text-xl font-bold text-text mb-4">Investment Summary</Text>
        <View className="bg-surface rounded-lg p-4 shadow-sm">
          <Text className="text-text text-center">No investments tracked</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;
