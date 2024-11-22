import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useApp } from '../context/AppContext';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: number;
  status: string;
}

const GoalsScreen = () => {
  const { database, isLoading } = useApp();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGoals = async () => {
    if (!database) return;
    const allGoals = await database.goals.find().exec();
    setGoals(allGoals.map(goal => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount || 0,
      deadline: goal.deadline,
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

  const getProgressColor = (current: number, target: number) => {
    const progress = (current / target) * 100;
    if (progress >= 100) return 'bg-success';
    if (progress >= 75) return 'bg-primary';
    if (progress >= 50) return 'bg-warning';
    return 'bg-danger';
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
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
        <TouchableOpacity className="m-4 bg-primary p-4 rounded-lg">
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
              const progressColor = getProgressColor(goal.currentAmount, goal.targetAmount);
              const remaining = goal.targetAmount - goal.currentAmount;

              return (
                <TouchableOpacity
                  key={goal.id}
                  className="bg-surface rounded-lg p-4 shadow-sm mb-3"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-bold text-text">{goal.name}</Text>
                    <Text className="text-sm text-text opacity-70">
                      Due: {formatDate(goal.deadline)}
                    </Text>
                  </View>

                  <View className="mb-2">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-sm text-text opacity-70">Progress</Text>
                      <Text className="text-sm font-bold text-primary">
                        ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                      </Text>
                    </View>
                    <View className="w-full h-2 bg-gray-200 rounded-full">
                      <View 
                        className={`h-full ${progressColor} rounded-full`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </View>
                  </View>

                  <View className="flex-row justify-between">
                    <Text className="text-sm text-text opacity-70">
                      {progress.toFixed(1)}% Complete
                    </Text>
                    <Text className="text-sm text-text opacity-70">
                      ${remaining.toFixed(2)} remaining
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default GoalsScreen;
