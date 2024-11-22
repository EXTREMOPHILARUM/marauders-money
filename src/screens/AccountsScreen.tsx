import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { AccountForm } from '../components/forms/AccountForm';
import { AccountCard } from '../components/list/AccountCard';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
  const totalAccounts = accounts.length;

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
        {/* Header Section */}
        <View className="px-4 pt-6 pb-4">
          <Text className="text-2xl font-bold text-text mb-1">Accounts</Text>
          <Text className="text-sm text-gray-500">
            {totalAccounts} {totalAccounts === 1 ? 'account' : 'accounts'} total
          </Text>
        </View>

        {/* Total Balance Card */}
        <View className="mx-4 mb-6">
          <View className="bg-primary rounded-2xl p-6 shadow-lg">
            <Text className="text-white/80 text-sm mb-2">Total Balance</Text>
            <Text className="text-white text-4xl font-bold">
              ${totalBalance.toFixed(2)}
            </Text>
            <View className="mt-4 flex-row items-center">
              <View className="flex-row items-center bg-white/20 rounded-full px-3 py-1">
                <Text className="text-white/90 text-sm">
                  Last updated {new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Add Account Button */}
        <TouchableOpacity 
          className="mx-4 mb-6 bg-primary/10 border-2 border-primary border-dashed p-4 rounded-xl flex-row items-center justify-center"
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
          <Text className="text-primary font-semibold ml-2">Add New Account</Text>
        </TouchableOpacity>

        {/* Accounts List */}
        <View className="px-4 pb-6">
          <Text className="text-xl font-bold text-text mb-4">Your Accounts</Text>
          {accounts.length === 0 ? (
            <View className="bg-surface rounded-xl p-6 shadow-sm border border-gray-100">
              <View className="items-center">
                <Ionicons name="wallet-outline" size={48} color="#94A3B8" />
                <Text className="text-gray-500 text-center mt-4 text-base">
                  No accounts added yet
                </Text>
                <Text className="text-gray-400 text-center mt-2 text-sm">
                  Add your first account to start tracking your finances
                </Text>
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onPress={() => {/* Handle account press */}}
                />
              ))}
            </View>
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
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-surface rounded-t-3xl">
            <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-xl font-bold text-text">Add New Account</Text>
              <TouchableOpacity
                className="p-2 -m-2"
                onPress={() => setShowForm(false)}
              >
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <View className="p-6">
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
