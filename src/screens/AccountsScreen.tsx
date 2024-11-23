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
  Alert,
  Dimensions,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { AccountForm } from '../components/forms/AccountForm';
import { AccountCard } from '../components/list/AccountCard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [editAccount, setEditAccount] = useState<Account | null>(null);

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

  useEffect(() => {
    fetchAccounts();
  }, [database]);

  const handleAddAccount = async (accountData: Omit<Account, 'id' | 'lastUpdated'>) => {
    if (!database) return;
    
    try {
      setIsSubmitting(true);
      
      if (editAccount) {
        // Update existing account
        const account = await database.accounts.findOne(editAccount.id).exec();
        if (!account) {
          throw new Error('Account not found');
        }

        await account.patch({
          name: accountData.name.trim(),
          type: accountData.type,
          currency: accountData.currency,
          institution: accountData.institution?.trim() || '',
          notes: accountData.notes?.trim() || '',
          lastUpdated: Date.now(),
        });
      } else {
        // Create new account
        const id = generateUUID();
        const now = Date.now();
        
        const newAccount = {
          id,
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
      }
      
      await fetchAccounts();
      handleCloseForm();
    } catch (error) {
      console.error('Failed to save account:', error);
      Alert.alert('Error', 'Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditAccount(account);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditAccount(null);
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!database) return;
    
    try {
      // Check if there are any transactions linked to this account
      const linkedTransactions = await database.transactions.find({
        selector: {
          accountId: accountId
        }
      }).exec();

      if (linkedTransactions.length > 0) {
        Alert.alert(
          'Cannot Delete Account',
          'This account has transactions linked to it. Please delete the transactions first or transfer them to another account.',
          [{ text: 'OK' }]
        );
        return;
      }

      setDeleteAccountId(accountId);
    } catch (error) {
      console.error('Error checking transactions:', error);
      Alert.alert('Error', 'Failed to check account transactions');
    }
  };

  const confirmDelete = async () => {
    if (!database || !deleteAccountId) return;
    
    try {
      setIsSubmitting(true);
      await database.accounts.findOne(deleteAccountId).remove();
      await fetchAccounts();
      setDeleteAccountId(null);
    } catch (error) {
      console.error('Failed to delete account:', error);
      Alert.alert('Error', 'Failed to delete account');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        contentContainerStyle={{
          paddingBottom: Platform.select({ ios: insets.bottom + 90, android: 90 })
        }}
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
              ₹{totalBalance.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
                <View 
                  key={account.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <TouchableOpacity 
                      className="flex-1"
                      onPress={() => handleEditAccount(account)}
                    >
                      <Text className="text-lg font-bold text-neutral-900">{account.name}</Text>
                      <Text className="text-sm text-neutral-500">{account.type}</Text>
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                      <Text className="text-lg font-bold text-primary-600">
                        ₹{account.balance.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => handleEditAccount(account)}
                        className="ml-4 p-2"
                      >
                        <Ionicons name="pencil-outline" size={20} color="#2563EB" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDeleteAccount(account.id)}
                        className="ml-2 p-2"
                      >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {account.institution && (
                    <Text className="text-sm text-neutral-500">{account.institution}</Text>
                  )}
                </View>
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
        onRequestClose={handleCloseForm}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity
            activeOpacity={1}
            className="flex-1 bg-black/50 justify-end"
            onPress={() => {
              Keyboard.dismiss();
              handleCloseForm();
            }}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
              className="max-h-[90%]"
            >
              <ScrollView 
                className="bg-white rounded-t-3xl"
                bounces={false}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                  <Text className="text-lg font-bold">
                    {editAccount ? 'Edit Account' : 'Add New Account'}
                  </Text>
                  <TouchableOpacity onPress={handleCloseForm} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
                <AccountForm
                  onSubmit={handleAddAccount}
                  isLoading={isSubmitting}
                  initialData={editAccount}
                  isEditMode={!!editAccount}
                />
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!deleteAccountId}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteAccountId(null)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 mx-4 w-[90%] max-w-[400px]">
            <Text className="text-xl font-bold text-neutral-900 mb-4">Delete Account?</Text>
            <Text className="text-neutral-600 mb-6">
              Are you sure you want to delete this account? This action cannot be undone.
            </Text>
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity
                onPress={() => setDeleteAccountId(null)}
                className="px-4 py-2 rounded-lg bg-neutral-100"
              >
                <Text className="text-neutral-900 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500"
                disabled={isSubmitting}
              >
                <Text className="text-white font-medium">
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AccountsScreen;
