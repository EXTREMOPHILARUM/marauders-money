import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Platform, 
  Modal, 
  Alert, 
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BudgetForm } from '../components/forms/BudgetForm';
import { BudgetCard } from '../components/list/BudgetCard';

const generateUUID = () => {
  return 'budget_' + 'xxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface Budget {
  id: string;
  name: string;
  amount: number;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: string;
  startDate: number;
  endDate: number;
  spent?: number;
  progress?: number;
  notes?: string;
}

const BudgetScreen = () => {
  const { database, isLoading } = useApp();
  const insets = useSafeAreaInsets();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const calculateBudgetProgress = async (budgets: Budget[]) => {
    if (!database) return budgets;

    const now = Date.now();
    const startOfMonth = new Date(new Date().setDate(1)).setHours(0, 0, 0, 0);
    
    // Get all transactions for the current month
    const transactions = await database.transactions.find({
      selector: {
        date: {
          $gte: startOfMonth,
          $lte: now
        },
        type: 'expense'
      }
    }).exec();

    // Calculate spending for each budget
    return budgets.map(budget => {
      const categoryTransactions = transactions.filter(t => t.category === budget.category);
      const spent = categoryTransactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
      const progress = Math.min((spent / budget.amount) * 100, 100);
      
      return {
        ...budget,
        spent,
        progress
      };
    });
  };

  const fetchBudgets = async () => {
    if (!database) return;
    const allBudgets = await database.budgets.find().exec();
    const budgetsWithBasicInfo = allBudgets.map(budget => ({
      id: budget.id,
      name: budget.name,
      amount: Number(budget.amount) || 0,
      currency: budget.currency,
      period: budget.period,
      category: budget.category,
      startDate: budget.startDate,
      endDate: budget.endDate,
      notes: budget.notes,
    }));

    const budgetsWithProgress = await calculateBudgetProgress(budgetsWithBasicInfo);
    setBudgets(budgetsWithProgress);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBudgets();
  }, [database]);

  const handleCreateBudget = async (formData: any) => {
    if (!database) return;
    
    try {
      setIsSubmitting(true);
      
      if (editBudget) {
        // Update existing budget
        const budget = await database.budgets.findOne(editBudget.id).exec();
        if (!budget) {
          throw new Error('Budget not found');
        }

        await budget.patch({
          name: formData.name.trim(),
          amount: formData.amount,
          category: formData.category.trim(),
          period: formData.period,
          startDate: formData.startDate.getTime(),
          endDate: formData.endDate.getTime(),
          notes: formData.notes?.trim() || '',
          updatedAt: Date.now(),
        });
      } else {
        // Create new budget
        const id = generateUUID();
        const now = Date.now();
        
        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
          throw new Error('Invalid amount');
        }

        const newBudget = {
          id,
          name: formData.name.trim(),
          amount,
          currency: 'INR',
          period: formData.period,
          category: formData.category.trim(),
          startDate: formData.startDate.getTime(),
          endDate: formData.endDate.getTime(),
          notes: formData.notes?.trim() || '',
          createdAt: now,
          updatedAt: now,
        };
        
        await database.budgets.insert(newBudget);
      }
      
      await fetchBudgets();
      setIsFormVisible(false);
      setEditBudget(null);
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBudget = (budget: Budget) => {
    setEditBudget(budget);
    setIsFormVisible(true);
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!database) return;
    
    try {
      const budget = await database.budgets.findOne(budgetId).exec();
      if (!budget) {
        throw new Error('Budget not found');
      }
      
      await budget.remove();
      await fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      Alert.alert('Error', 'Failed to delete budget');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + (Number(budget.amount) || 0), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + (Number(budget.spent) || 0), 0);
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

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
            <Text className="text-2xl font-bold text-neutral-900 mb-1">Budget</Text>
            <Text className="text-sm text-neutral-500">
              {budgets.length} {budgets.length === 1 ? 'category' : 'categories'} total
            </Text>
          </View>

          {/* Total Budget Overview Card */}
          <View className="mx-4 mb-6">
            <View className="bg-primary-600 rounded-2xl p-6 shadow-lg">
              <Text className="text-white/80 text-sm mb-2">Total Budget</Text>
              <Text className="text-white text-4xl font-bold">
                {formatCurrency(totalBudget)}
              </Text>
              <View className="mt-4">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-white/90 text-sm">
                    Spent: {formatCurrency(totalSpent)}
                  </Text>
                  <Text className="text-white/90 text-sm">
                    {spentPercentage.toFixed(1)}%
                  </Text>
                </View>
                <View className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <View 
                    className="h-full bg-white" 
                    style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Add Budget Button */}
          <TouchableOpacity 
            className="mx-4 mb-6 bg-primary-50 border-2 border-primary-600 border-dashed p-4 rounded-xl flex-row items-center justify-center"
            onPress={() => setIsFormVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
            <Text className="text-primary-600 font-semibold ml-2">Create New Budget</Text>
          </TouchableOpacity>

          {/* Budget Categories */}
          <View className="px-4 pb-6">
            <Text className="text-xl font-bold text-neutral-900 mb-4">Budget Categories</Text>
            <View className="space-y-4">
              {budgets.length === 0 ? (
                <View className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
                  <View className="items-center">
                    <Ionicons name="pie-chart-outline" size={48} color="#94A3B8" />
                    <Text className="text-neutral-500 text-center mt-4 text-base">
                      No budgets added yet
                    </Text>
                    <Text className="text-neutral-400 text-center mt-2 text-sm">
                      Add your first budget to start managing your expenses
                    </Text>
                  </View>
                </View>
              ) : (
                budgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    isMenuActive={activeMenuId === budget.id}
                    onToggleMenu={() => setActiveMenuId(activeMenuId === budget.id ? null : budget.id)}
                    onEdit={handleEditBudget}
                    onDelete={handleDeleteBudget}
                    formatCurrency={formatCurrency}
                  />
                ))
              )}
            </View>
          </View>

          {/* Budget Form Modal */}
          <Modal
            visible={isFormVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => {
              Keyboard.dismiss();
              setIsFormVisible(false);
            }}
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
                  setIsFormVisible(false);
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
                  >
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                      <Text className="text-lg font-bold">
                        {editBudget ? 'Edit Budget' : 'Create New Budget'}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => {
                          Keyboard.dismiss();
                          setIsFormVisible(false);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="close" size={24} color="#000" />
                      </TouchableOpacity>
                    </View>
                    <BudgetForm
                      onSubmit={handleCreateBudget}
                      isLoading={isSubmitting}
                      initialData={editBudget}
                    />
                  </ScrollView>
                </TouchableOpacity>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </Modal>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default BudgetScreen;
