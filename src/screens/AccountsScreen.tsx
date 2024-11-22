import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useApp } from '../context/AppContext';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

const AccountsScreen = () => {
  const { database, isLoading } = useApp();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccounts = async () => {
    if (!database) return;
    const allAccounts = await database.accounts.find().exec();
    setAccounts(allAccounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: acc.balance,
      currency: acc.currency,
    })));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAccounts();
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
        {/* Add Account Button */}
        <TouchableOpacity className="m-4 bg-primary p-4 rounded-lg">
          <Text className="text-white text-center font-bold">Add New Account</Text>
        </TouchableOpacity>

        {/* Accounts List */}
        <View className="px-4">
          {accounts.length === 0 ? (
            <View className="bg-surface rounded-lg p-4 shadow-sm">
              <Text className="text-text text-center">No accounts added yet</Text>
            </View>
          ) : (
            accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                className="bg-surface rounded-lg p-4 shadow-sm mb-3"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-lg font-bold text-text">{account.name}</Text>
                    <Text className="text-sm text-text opacity-70">{account.type}</Text>
                  </View>
                  <Text className="text-lg font-bold text-primary">
                    {account.currency} {account.balance.toFixed(2)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default AccountsScreen;
