import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { TransactionForm } from '../components/forms/TransactionForm';
import { TransactionItem } from '../components/list/TransactionItem';
import { SpendingChart } from '../components/charts/SpendingChart';
import { Account } from '../types/account';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: number;
  accountId: string;
}

const TransactionsScreen = () => {
  const { database, isLoading } = useApp();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    if (!database) return;
    
    // Fetch transactions
    const allTransactions = await database.transactions.find().exec();
    setTransactions(allTransactions.map(tx => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
      description: tx.description,
      date: tx.date,
      accountId: tx.accountId,
    })));

    // Fetch accounts for the form
    const allAccounts = await database.accounts.find().exec();
    setAccounts(allAccounts.map(acc => acc));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    if (!database) return;
    
    // Start a write batch
    const batch = database.batch();

    try {
      // Add transaction
      batch.add(database.transactions.insert({
        ...transactionData,
        createdAt: Date.now(),
      }));

      // Update account balance
      const account = await database.accounts.findOne(transactionData.accountId).exec();
      if (account) {
        const balanceChange = transactionData.type === 'income' ? 
          transactionData.amount : -transactionData.amount;
        
        batch.add(database.accounts.update({
          id: account.id,
          balance: account.balance + balanceChange,
          lastUpdated: Date.now(),
        }));
      }

      // Execute batch
      await batch.commit();
      
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Failed to add transaction:', error);
      // Handle error (show error message to user)
    }
  };

  useEffect(() => {
    fetchData();
  }, [database]);

  const getSpendingData = () => {
    const dailyData = new Map<string, number>();
    
    transactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        dailyData.set(date, (dailyData.get(date) || 0) + tx.amount);
      });

    return Array.from(dailyData.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-30)
      .map(([date, amount]) => ({
        date,
        amount,
      }));
  };

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
        {/* Spending Chart */}
        <View className="p-4">
          <Text className="text-lg font-semibold text-text mb-2">30-Day Spending Trend</Text>
          <SpendingChart data={getSpendingData()} />
        </View>

        {/* Add Transaction Button */}
        <TouchableOpacity 
          className="mx-4 mb-4 bg-primary p-4 rounded-lg"
          onPress={() => setShowForm(true)}
        >
          <Text className="text-white text-center font-bold">Add Transaction</Text>
        </TouchableOpacity>

        {/* Transactions List */}
        <View className="px-4">
          <Text className="text-xl font-bold text-text mb-4">Recent Transactions</Text>
          {transactions.length === 0 ? (
            <View className="bg-surface rounded-lg p-4 shadow-sm">
              <Text className="text-text text-center">No transactions yet</Text>
            </View>
          ) : (
            transactions
              .sort((a, b) => b.date - a.date)
              .map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  accountName={accounts.find(acc => acc.id === transaction.accountId)?.name}
                  onPress={() => {/* Handle transaction press */}}
                />
              ))
          )}
        </View>
      </ScrollView>

      {/* Transaction Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-surface rounded-t-3xl">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-text text-center">Add Transaction</Text>
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowForm(false)}
              >
                <Text className="text-primary text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <View className="p-4">
              <TransactionForm
                onSubmit={handleAddTransaction}
                accounts={accounts}
                isLoading={isLoading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TransactionsScreen;
