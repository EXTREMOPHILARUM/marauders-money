import React, { useState, useEffect } from 'react';
import { 
  View, 
  RefreshControl,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { AccountForm } from '../components/forms/AccountForm';
import { AccountCard } from '../components/list/AccountCard';
import { generateUUID } from '../utils/uuid';
import { formatCurrency } from '../utils/formatters';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { AddItemButton } from '../components/common/AddItemButton';
import { FormModal } from '../components/common/FormModal';
import { SummaryCard } from '../components/common/SummaryCard';
import { EmptyState } from '../components/common/EmptyState';
import { ListContainer } from '../components/common/ListContainer';

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
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyChange, setMonthlyChange] = useState(0);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
    setTotalBalance(allAccounts.reduce((sum, acc) => sum + acc.balance, 0));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAccounts();
  }, [database]);

  const handleCreateAccount = async (accountData: Omit<Account, 'id' | 'lastUpdated'>) => {
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
      setIsFormVisible(false);
      setEditAccount(null);
    } catch (error) {
      console.error('Failed to save account:', error);
      Alert.alert('Error', 'Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditAccount(account);
    setIsFormVisible(true);
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

      await database.accounts.findOne(accountId).remove();
      await fetchAccounts();
    } catch (error) {
      console.error('Error checking transactions:', error);
      Alert.alert('Error', 'Failed to check account transactions');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-neutral-700">Loading...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => setActiveMenuId(null)}>
      <View className="flex-1 bg-background">
        <ListContainer
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <ScreenHeader 
            title="Accounts" 
            count={accounts.length}
            countLabel="accounts"
          />

          <SummaryCard
            title="Total Balance"
            value={formatCurrency(totalBalance)}
            change={{
              value: monthlyChange,
              percentage: totalBalance > 0 ? ((monthlyChange / (totalBalance - monthlyChange)) * 100) : 0,
            }}
            type="account"
          />

          <AddItemButton
            onPress={() => setIsFormVisible(true)}
            label="Add New Account"
          />

          <View className="px-4 pb-6">
            {accounts.length === 0 ? (
              <EmptyState
                icon="wallet-outline"
                title="No accounts added yet"
                description="Add your first account to start tracking your finances"
              />
            ) : (
              <View className="space-y-3">
                {accounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    isMenuActive={activeMenuId === account.id}
                    onToggleMenu={() => setActiveMenuId(activeMenuId === account.id ? null : account.id)}
                    onEdit={handleEditAccount}
                    onDelete={handleDeleteAccount}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </View>
            )}
          </View>
        </ListContainer>

        <FormModal
          visible={isFormVisible}
          onClose={() => {
            setIsFormVisible(false);
            setEditAccount(null);
          }}
          title={editAccount ? 'Edit Account' : 'Add New Account'}
          isSubmitting={isSubmitting}
        >
          <AccountForm
            onSubmit={handleCreateAccount}
            isLoading={isSubmitting}
            initialData={editAccount}
            isEditMode={!!editAccount}
          />
        </FormModal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AccountsScreen;
