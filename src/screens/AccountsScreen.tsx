import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { AccountForm } from '../components/forms/AccountForm';
import { AccountCard } from '../components/list/AccountCard';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  institution?: string;
  notes?: string;
  lastUpdated: number;
}

const AccountsScreen = () => {
  const { database, isLoading } = useApp();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchAccounts = async () => {
    if (!database) return;
    const allAccounts = await database.accounts.find().exec();
    setAccounts(allAccounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: acc.balance,
      currency: acc.currency,
      institution: acc.institution,
      notes: acc.notes,
      lastUpdated: acc.lastUpdated || Date.now(),
    })));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  };

  const handleAddAccount = async (accountData: Omit<Account, 'id' | 'lastUpdated'>) => {
    if (!database) return;
    
    await database.accounts.insert({
      ...accountData,
      lastUpdated: Date.now(),
      createdAt: Date.now(),
    });
    
    setShowForm(false);
    fetchAccounts();
  };

  useEffect(() => {
    fetchAccounts();
  }, [database]);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

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
        {/* Total Balance Card */}
        <View className="m-4 bg-primary rounded-lg p-6">
          <Text className="text-white text-sm mb-1">Total Balance</Text>
          <Text className="text-white text-3xl font-bold">
            ${totalBalance.toFixed(2)}
          </Text>
        </View>

        {/* Add Account Button */}
        <TouchableOpacity 
          className="mx-4 mb-4 bg-surface border border-primary p-4 rounded-lg"
          onPress={() => setShowForm(true)}
        >
          <Text className="text-primary text-center font-bold">Add New Account</Text>
        </TouchableOpacity>

        {/* Accounts List */}
        <View className="px-4">
          <Text className="text-xl font-bold text-text mb-4">Your Accounts</Text>
          {accounts.length === 0 ? (
            <View className="bg-surface rounded-lg p-4 shadow-sm">
              <Text className="text-text text-center">No accounts added yet</Text>
            </View>
          ) : (
            accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onPress={() => {/* Handle account press */}}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Account Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-surface rounded-t-3xl">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-text text-center">Add New Account</Text>
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowForm(false)}
              >
                <Text className="text-primary text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <View className="p-4">
              <AccountForm
                onSubmit={handleAddAccount}
                isLoading={isLoading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AccountsScreen;
