import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { GoalForm } from '../components/forms/GoalForm';
import { ProgressBar } from '../components/charts/ProgressBar';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: number;
  category: 'savings' | 'debt' | 'investment' | 'purchase';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  status: string;
}

const GoalsScreen = () => {
  const { database, isLoading } = useApp();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchGoals = async () => {
    if (!database) return;
    const allGoals = await database.goals.find().exec();
    setGoals(allGoals.map(goal => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount || 0,
      deadline: goal.deadline,
      category: goal.category || 'savings',
      priority: goal.priority || 'medium',
      notes: goal.notes,
      status: goal.status || 'in_progress',
    })));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGoals();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchGoals();
  }, [database]);

  const handleSubmitGoal = async (goalData: Omit<Goal, 'id' | 'status'>) => {
    if (!database) return;
    
    await database.goals.insert({
      ...goalData,
      status: 'in_progress',
      createdAt: Date.now(),
    });
    
    setShowForm(false);
    fetchGoals();
  };

  const getPriorityColor = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
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
        {/* Add Goal Button */}
        <TouchableOpacity 
          className="m-4 bg-primary p-4 rounded-lg"
          onPress={() => setShowForm(true)}
        >
          <Text className="text-white text-center font-bold">Create New Goal</Text>
        </TouchableOpacity>

        {/* Goals Overview */}
        <View className="px-4">
          <Text className="text-xl font-bold text-text mb-2">Your Financial Goals</Text>
          {goals.length === 0 ? (
            <View className="bg-surface rounded-lg p-4 shadow-sm">
              <Text className="text-text text-center">No goals set yet</Text>
            </View>
          ) : (
            goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const remaining = goal.targetAmount - goal.currentAmount;

              return (
                <TouchableOpacity
                  key={goal.id}
                  className="bg-surface rounded-lg p-4 shadow-sm mb-3"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-text">{goal.name}</Text>
                      <Text className="text-sm text-text opacity-70">
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className={`px-2 py-1 rounded ${getPriorityColor(goal.priority)}`}>
                      <Text className="text-white text-xs capitalize">{goal.priority}</Text>
                    </View>
                  </View>

                  <View className="mb-2">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-sm text-text opacity-70">Progress</Text>
                      <Text className="text-sm font-bold text-primary">
                        ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                      </Text>
                    </View>
                    <ProgressBar 
                      progress={progress} 
                      color={goal.category === 'savings' ? '#10B981' : 
                             goal.category === 'debt' ? '#EF4444' : 
                             goal.category === 'investment' ? '#3B82F6' : '#8B5CF6'}
                    />
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-sm text-text opacity-70">
                      {progress.toFixed(1)}% Complete
                    </Text>
                    <Text className="text-sm text-text opacity-70">
                      ${remaining.toFixed(2)} remaining
                    </Text>
                  </View>

                  {goal.notes && (
                    <Text className="text-sm text-text opacity-70 mt-2 italic">
                      {goal.notes}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Goal Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-surface rounded-t-3xl">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-xl font-bold text-text text-center">Create New Goal</Text>
              <TouchableOpacity
                className="absolute right-4 top-4"
                onPress={() => setShowForm(false)}
              >
                <Text className="text-primary text-lg">Cancel</Text>
              </TouchableOpacity>
            </View>
            
            <View className="p-4">
              <GoalForm
                onSubmit={handleSubmitGoal}
                isLoading={isLoading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default GoalsScreen;
