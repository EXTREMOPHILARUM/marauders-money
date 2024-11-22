import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
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

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const AccountsScreen = () => {
  const { database, isLoading: dbLoading } = useApp();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    try {
      setIsSubmitting(true);
      
      const id = generateUUID();
      const now = Date.now();
      
      const newAccount = {
        id, // Primary key must be set explicitly
        name: accountData.name.trim(),
        type: accountData.type,
        balance: accountData.balance,
        currency: accountData.currency,
        institution: accountData.institution?.trim() || '',
        notes: accountData.notes?.trim() || '',
        createdAt: now,
        updatedAt: now,
      };
      
      await database.accounts.insert(newAccount);
      await fetchAccounts();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add account:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [database]);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const totalAccounts = accounts.length;

  if (dbLoading) {
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View className="px-4 pt-6 pb-4">
          <Text className="text-2xl font-bold text-neutral-900 mb-1">Accounts</Text>
          <Text className="text-sm text-neutral-500">
            {totalAccounts} {totalAccounts === 1 ? 'account' : 'accounts'} total
          </Text>
        </View>

        {/* Total Balance Card */}
        <View className="mx-4 mb-6">
          <View className="bg-primary-600 rounded-2xl p-6 shadow-lg">
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
          className="mx-4 mb-6 bg-primary-50 border-2 border-primary-600 border-dashed p-4 rounded-xl flex-row items-center justify-center"
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
          <Text className="text-primary-600 font-semibold ml-2">Add New Account</Text>
        </TouchableOpacity>

        {/* Accounts List */}
        <View className="px-4 pb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-4">Your Accounts</Text>
          {accounts.length === 0 ? (
            <View className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
              <View className="items-center">
                <Ionicons name="wallet-outline" size={48} color="#94A3B8" />
                <Text className="text-neutral-500 text-center mt-4 text-base">
                  No accounts added yet
                </Text>
                <Text className="text-neutral-400 text-center mt-2 text-sm">
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
        <TouchableOpacity 
          className="flex-1 bg-black/50"
          activeOpacity={1} 
          onPress={() => {
            Keyboard.dismiss();
            setShowForm(false);
          }}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            className="flex-1 justify-end"
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={() => Keyboard.dismiss()}
            >
              <ScrollView 
                className="bg-white rounded-t-3xl"
                bounces={false}
                keyboardShouldPersistTaps="handled"
              >
                <View className="px-6 py-4 border-b border-neutral-100 flex-row justify-between items-center">
                  <Text className="text-xl font-bold text-neutral-900">Add New Account</Text>
                  <TouchableOpacity
                    className="p-2 -m-2"
                    onPress={() => setShowForm(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>
                
                <View className="p-6">
                  <AccountForm
                    onSubmit={handleAddAccount}
                    isLoading={isSubmitting}
                  />
                </View>
              </ScrollView>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default AccountsScreen;
