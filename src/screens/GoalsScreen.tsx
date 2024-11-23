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
} from 'react-native';
import { useApp } from '../context/AppContext';
import { GoalForm } from '../components/forms/GoalForm';
import { ProgressBar } from '../components/charts/ProgressBar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

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
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'savings': return 'save-outline';
      case 'debt': return 'card-outline';
      case 'investment': return 'trending-up-outline';
      case 'purchase': return 'cart-outline';
      default: return 'flag-outline';
    }
  };

  const totalProgress = goals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount) * 100, 0) / (goals.length || 1);

  if (isLoading) {
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
          <Text className="text-2xl font-bold text-neutral-900 mb-1">Goals</Text>
          <Text className="text-sm text-neutral-500">
            {goals.length} {goals.length === 1 ? 'goal' : 'goals'} total
          </Text>
        </View>

        {/* Goals Overview Card */}
        <View className="mx-4 mb-6">
          <View className="bg-primary-600 rounded-2xl p-6 shadow-lg">
            <Text className="text-white/80 text-sm mb-2">Overall Progress</Text>
            <Text className="text-white text-4xl font-bold">
              {totalProgress.toFixed(1)}%
            </Text>
            <View className="mt-4">
              <View className="w-full h-2 bg-white/20 rounded-full">
                <View 
                  className="h-full bg-white rounded-full"
                  style={{ width: `${totalProgress}%` }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Add Goal Button */}
        <TouchableOpacity 
          className="mx-4 mb-6 bg-primary-50 border-2 border-primary-600 border-dashed p-4 rounded-xl flex-row items-center justify-center"
          onPress={() => setShowForm(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#2563EB" />
          <Text className="text-primary-600 font-semibold ml-2">Create New Goal</Text>
        </TouchableOpacity>

        {/* Goals List */}
        <View className="px-4 pb-6">
          <Text className="text-xl font-bold text-neutral-900 mb-4">Your Financial Goals</Text>
          {goals.length === 0 ? (
            <View className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
              <View className="items-center">
                <Ionicons name="flag-outline" size={48} color="#94A3B8" />
                <Text className="text-neutral-500 text-center mt-4 text-base">
                  No goals set yet
                </Text>
                <Text className="text-neutral-400 text-center mt-2 text-sm">
                  Start planning your financial future by creating your first goal
                </Text>
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              {goals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const remaining = goal.targetAmount - goal.currentAmount;
                const priorityStyle = getPriorityColor(goal.priority);

                return (
                  <TouchableOpacity
                    key={goal.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100"
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View className="flex-row items-center flex-1">
                        <View className="bg-primary-50 p-2 rounded-lg mr-3">
                          <Ionicons name={getCategoryIcon(goal.category)} size={24} color="#2563EB" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-bold text-neutral-900">{goal.name}</Text>
                          <Text className="text-sm text-neutral-500">
                            Due: {new Date(goal.deadline).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <View className={`px-3 py-1 rounded-full ${priorityStyle}`}>
                        <Text className="text-xs capitalize">{goal.priority}</Text>
                      </View>
                    </View>

                    <View className="mb-3">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-sm text-neutral-500">Progress</Text>
                        <Text className="text-sm font-medium text-neutral-900">
                          ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                        </Text>
                      </View>
                      <View className="w-full h-2 bg-neutral-100 rounded-full">
                        <View 
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </View>
                    </View>

                    <View className="flex-row justify-between">
                      <Text className="text-sm text-neutral-500">
                        {progress.toFixed(1)}% Complete
                      </Text>
                      <Text className="text-sm text-neutral-500">
                        ${remaining.toFixed(2)} remaining
                      </Text>
                    </View>

                    {goal.notes && (
                      <Text className="text-sm text-neutral-500 mt-2 bg-neutral-50 p-2 rounded-lg">
                        {goal.notes}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
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
                  <Text className="text-xl font-bold text-neutral-900">Create New Goal</Text>
                  <TouchableOpacity
                    className="p-2 -m-2"
                    onPress={() => setShowForm(false)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>
                
                <View className="p-6">
                  <GoalForm
                    onSubmit={handleSubmitGoal}
                    isLoading={isLoading}
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

export default GoalsScreen;
