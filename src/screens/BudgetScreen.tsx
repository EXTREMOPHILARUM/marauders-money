import React, { useState, useEffect } from 'react';
import { 
  View, 
  RefreshControl,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { BudgetForm } from '../components/forms/BudgetForm';
import { BudgetCard } from '../components/list/BudgetCard';
import { generateUUID } from '../utils/uuid';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/formatters';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { AddItemButton } from '../components/common/AddItemButton';
import { FormModal } from '../components/common/FormModal';
import { SummaryCard } from '../components/common/SummaryCard';
import { EmptyState } from '../components/common/EmptyState';
import { ListContainer } from '../components/common/ListContainer';

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
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
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
    setTotalBudget(budgetsWithProgress.reduce((sum, budget) => sum + (Number(budget.amount) || 0), 0));
    setTotalSpent(budgetsWithProgress.reduce((sum, budget) => sum + (Number(budget.spent) || 0), 0));
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
            title="Budgets" 
            count={budgets.length}
            countLabel="budgets"
          />

          <SummaryCard
            title="Total Budget"
            value={formatCurrency(totalBudget)}
            change={{
              value: totalSpent,
              percentage: totalBudget > 0 ? ((totalSpent / totalBudget) * 100) : 0,
            }}
            type="budget"
          />

          <AddItemButton
            onPress={() => setIsFormVisible(true)}
            label="Add New Budget"
          />

          <View className="px-4 pb-6">
            {budgets.length === 0 ? (
              <EmptyState
                icon="pie-chart-outline"
                title="No budgets added yet"
                description="Create your first budget to start tracking your spending"
              />
            ) : (
              <View className="space-y-3">
                {budgets.map((budget) => (
                  <BudgetCard
                    key={budget.id}
                    budget={budget}
                    isMenuActive={activeMenuId === budget.id}
                    onToggleMenu={() => setActiveMenuId(activeMenuId === budget.id ? null : budget.id)}
                    onEdit={handleEditBudget}
                    onDelete={handleDeleteBudget}
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
            setEditBudget(null);
          }}
          title={editBudget ? 'Edit Budget' : 'Add New Budget'}
          isSubmitting={isSubmitting}
        >
          <BudgetForm
            onSubmit={handleCreateBudget}
            isLoading={isSubmitting}
            initialData={editBudget}
            isEditMode={!!editBudget}
          />
        </FormModal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default BudgetScreen;
