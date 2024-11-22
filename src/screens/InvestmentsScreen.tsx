import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useApp } from '../context/AppContext';

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
        {/* Add Investment Button */}
        <TouchableOpacity className="m-4 bg-primary p-4 rounded-lg">
          <Text className="text-white text-center font-bold">Add New Investment</Text>
        </TouchableOpacity>

        {/* Portfolio Overview */}
        <View className="px-4 mb-4">
          <Text className="text-xl font-bold text-text mb-2">Portfolio Overview</Text>
          <View className="bg-surface rounded-lg p-4 shadow-sm">
            <View className="flex-row justify-between mb-2">
              <Text className="text-text">Total Value</Text>
              <Text className="font-bold text-primary">
                ${totalValue.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-text">Total Gain/Loss</Text>
              <Text className={`font-bold ${totalGain >= 0 ? 'text-success' : 'text-danger'}`}>
                ${totalGain.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Investments List */}
        <View className="px-4">
          <Text className="text-xl font-bold text-text mb-2">Your Investments</Text>
          {investments.length === 0 ? (
            <View className="bg-surface rounded-lg p-4 shadow-sm">
              <Text className="text-text text-center">No investments added yet</Text>
            </View>
          ) : (
            investments.map((investment) => {
              const currentValue = investment.currentPrice * investment.quantity;
              const purchaseValue = investment.purchasePrice * investment.quantity;
              const gain = currentValue - purchaseValue;
              const gainPercentage = ((currentValue / purchaseValue) - 1) * 100;

              return (
                <TouchableOpacity
                  key={investment.id}
                  className="bg-surface rounded-lg p-4 shadow-sm mb-3"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View>
                      <Text className="text-lg font-bold text-text">{investment.symbol}</Text>
                      <Text className="text-sm text-text opacity-70">{investment.name}</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-lg font-bold text-primary">
                        ${currentValue.toFixed(2)}
                      </Text>
                      <Text className={`text-sm ${gain >= 0 ? 'text-success' : 'text-danger'}`}>
                        {gainPercentage.toFixed(2)}%
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-text opacity-70">
                      {investment.quantity} shares @ ${investment.purchasePrice.toFixed(2)}
                    </Text>
                    <Text className={`text-sm ${gain >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${gain.toFixed(2)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default InvestmentsScreen;
