import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Investment {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: number;
}

const InvestmentsScreen = () => {
  const { database, isLoading } = useApp();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const insets = useSafeAreaInsets();

  const fetchInvestments = async () => {
    if (!database) return;
    const allInvestments = await database.investments.find().exec();
    const investmentsList = allInvestments.map(inv => ({
      id: inv.id,
      symbol: inv.symbol,
      name: inv.name,
      quantity: inv.quantity,
      purchasePrice: inv.purchasePrice,
      currentPrice: inv.currentPrice,
      purchaseDate: inv.purchaseDate,
    }));
    
    setInvestments(investmentsList);
    
    // Calculate totals
    const value = investmentsList.reduce((sum, inv) => 
      sum + (inv.currentPrice * inv.quantity), 0);
    const cost = investmentsList.reduce((sum, inv) => 
      sum + (inv.purchasePrice * inv.quantity), 0);
    
    setTotalValue(value);
    setTotalGain(value - cost);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvestments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchInvestments();
  }, [database]);

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
          <Text className="text-2xl font-bold text-neutral-900 mb-1">Investments</Text>
          <Text className="text-sm text-neutral-500">
            {investments.length} {investments.length === 1 ? 'investment' : 'investments'} total
          </Text>
        </View>

        {/* Portfolio Overview Card */}
        <View className="mx-4 mb-6">
          <View className="bg-primary-600 rounded-2xl p-6 shadow-lg">
            <Text className="text-white/80 text-sm mb-2">Portfolio Value</Text>
            <Text className="text-white text-4xl font-bold">
              ${totalValue.toFixed(2)}
            </Text>
            <View className="mt-4 flex-row items-center">
              <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1">
                <Text className={`text-white/90 text-sm ${totalGain >= 0 ? '' : 'text-red-200'}`}>
                  {totalGain >= 0 ? '+' : ''}{totalGain.toFixed(2)} ({((totalGain / (totalValue - totalGain)) * 100).toFixed(2)}%)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Add Investment Button */}
        <TouchableOpacity 
          className="mx-4 mb-6 bg-primary-50 border-2 border-primary-600 border-dashed p-4 rounded-xl flex-row items-center justify-center"
        >
          <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
          <Text className="text-primary-600 font-semibold ml-2">Add New Investment</Text>
        </TouchableOpacity>

        {/* Investments List */}
        <View className="px-4 pb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-4">Your Investments</Text>
          {investments.length === 0 ? (
            <View className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
              <View className="items-center">
                <Ionicons name="trending-up-outline" size={48} color="#94A3B8" />
                <Text className="text-neutral-500 text-center mt-4 text-base">
                  No investments added yet
                </Text>
                <Text className="text-neutral-400 text-center mt-2 text-sm">
                  Start building your portfolio by adding your first investment
                </Text>
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              {investments.map((investment) => {
                const currentValue = investment.currentPrice * investment.quantity;
                const purchaseValue = investment.purchasePrice * investment.quantity;
                const gain = currentValue - purchaseValue;
                const gainPercentage = ((currentValue / purchaseValue) - 1) * 100;

                return (
                  <TouchableOpacity
                    key={investment.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <View>
                        <Text className="text-lg font-bold text-neutral-900">{investment.symbol}</Text>
                        <Text className="text-sm text-neutral-500">{investment.name}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-lg font-bold text-neutral-900">
                          ${currentValue.toFixed(2)}
                        </Text>
                        <Text className={`text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gain >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-neutral-500">
                        {investment.quantity} shares @ ${investment.purchasePrice.toFixed(2)}
                      </Text>
                      <Text className={`text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gain >= 0 ? '+' : ''}${gain.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default InvestmentsScreen;
