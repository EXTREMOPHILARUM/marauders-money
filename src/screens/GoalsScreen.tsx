import React, { useState, useEffect } from 'react';
import { 
  View, 
  RefreshControl,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { GoalForm } from '../components/forms/GoalForm';
import { GoalCard } from '../components/list/GoalCard';
import { generateUUID } from '../utils/uuid';
import { formatCurrency } from '../utils/formatters';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { AddItemButton } from '../components/common/AddItemButton';
import { FormModal } from '../components/common/FormModal';
import { SummaryCard } from '../components/common/SummaryCard';
import { EmptyState } from '../components/common/EmptyState';
import { ListContainer } from '../components/common/ListContainer';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: number;
  category: 'savings' | 'debt' | 'investment' | 'purchase' | 'emergency' | 'retirement';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  status: string;
  createdAt?: number;
  updatedAt?: number;
}

const GoalsScreen = () => {
  const { database, isLoading } = useApp();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalTargetAmount, setTotalTargetAmount] = useState(0);
  const [totalCurrentAmount, setTotalCurrentAmount] = useState(0);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchGoals = async () => {
    if (!database) return;
    const allGoals = await database.goals.find().exec();
    const goalsData = allGoals.map(goal => ({
      id: goal.id,
      name: goal.name,
      targetAmount: Number(goal.targetAmount) || 0,
      currentAmount: Number(goal.currentAmount) || 0,
      deadline: goal.deadline,
      category: goal.category || 'savings',
      priority: goal.priority || 'medium',
      notes: goal.notes,
      status: goal.status || 'in_progress',
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
    }));

    setGoals(goalsData);
    setTotalTargetAmount(goalsData.reduce((sum, goal) => sum + goal.targetAmount, 0));
    setTotalCurrentAmount(goalsData.reduce((sum, goal) => sum + goal.currentAmount, 0));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGoals();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchGoals();
  }, [database]);

  const handleCreateGoal = async (formData: any) => {
    if (!database) return;
    
    try {
      setIsSubmitting(true);
      
      if (editGoal) {
        const goal = await database.goals.findOne(editGoal.id).exec();
        if (!goal) {
          throw new Error('Goal not found');
        }

        await goal.patch({
          name: formData.name.trim(),
          targetAmount: formData.targetAmount,
          currentAmount: formData.currentAmount,
          deadline: formData.deadline.getTime(),
          category: formData.category,
          priority: formData.priority,
          notes: formData.notes?.trim() || '',
          updatedAt: Date.now(),
        });
      } else {
        const id = generateUUID('goal');
        const now = Date.now();
        
        const targetAmount = parseFloat(formData.targetAmount);
        const currentAmount = parseFloat(formData.currentAmount);
        if (isNaN(targetAmount) || targetAmount <= 0) {
          throw new Error('Invalid target amount');
        }
        if (isNaN(currentAmount) || currentAmount < 0) {
          throw new Error('Invalid current amount');
        }

        const newGoal = {
          id,
          name: formData.name.trim(),
          targetAmount,
          currentAmount,
          deadline: formData.deadline.getTime(),
          category: formData.category,
          priority: formData.priority,
          notes: formData.notes?.trim() || '',
          status: 'in_progress',
          createdAt: now,
          updatedAt: now,
        };
        
        await database.goals.insert(newGoal);
      }
      
      await fetchGoals();
      setIsFormVisible(false);
      setEditGoal(null);
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditGoal(goal);
    setIsFormVisible(true);
    setActiveMenuId(null);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!database) return;
    
    try {
      const goal = await database.goals.findOne(goalId).exec();
      if (!goal) {
        throw new Error('Goal not found');
      }
      
      await goal.remove();
      await fetchGoals();
      setActiveMenuId(null);
    } catch (error) {
      console.error('Error deleting goal:', error);
      Alert.alert('Error', 'Failed to delete goal');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <EmptyState
          icon="hourglass-outline"
          title="Loading..."
          message="Please wait while we fetch your goals"
        />
      </View>
    );
  }

  const totalProgress = goals.length > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <TouchableWithoutFeedback onPress={() => setActiveMenuId(null)}>
      <View className="flex-1 bg-background">
        <ListContainer
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <ScreenHeader 
            title="Goals" 
            count={goals.length}
            countLabel="goals"
          />

          <SummaryCard
            title="Total Progress"
            value={formatCurrency(totalCurrentAmount)}
            change={{
              value: totalTargetAmount,
              percentage: totalProgress,
            }}
            type="goal"
            colorScheme={totalProgress >= 100 ? 'success' : 'primary'}
          />

          <AddItemButton
            onPress={() => {
              setEditGoal(null);
              setIsFormVisible(true);
            }}
            label="Add New Goal"
          />

          <View className="px-4 pb-6">
            {goals.length === 0 ? (
              <EmptyState
                icon="flag-outline"
                title="No goals added yet"
                description="Create your first goal to start tracking your progress"
              />
            ) : (
              <View className="space-y-3">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={{
                      ...goal,
                      deadline: new Date(goal.deadline),
                    }}
                    isMenuActive={activeMenuId === goal.id}
                    onToggleMenu={() => setActiveMenuId(activeMenuId === goal.id ? null : goal.id)}
                    onEdit={handleEditGoal}
                    onDelete={handleDeleteGoal}
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
            setEditGoal(null);
          }}
          title={editGoal ? 'Edit Goal' : 'Add New Goal'}
          isSubmitting={isSubmitting}
        >
          <GoalForm
            onSubmit={handleCreateGoal}
            onCancel={() => {
              setIsFormVisible(false);
              setEditGoal(null);
            }}
            initialData={editGoal ? {
              ...editGoal,
              deadline: new Date(editGoal.deadline),
            } : undefined}
            isLoading={isSubmitting}
            isEditMode={!!editGoal}
          />
        </FormModal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default GoalsScreen;
