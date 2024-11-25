import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatCurrency } from '../../utils/currency';
import { MenuToggle } from '../common/MenuToggle'; // Assuming MenuToggle is a separate component

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category: 'savings' | 'debt' | 'investment' | 'purchase' | 'emergency' | 'retirement';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface GoalCardProps {
  goal: Goal;
  isMenuActive: boolean;
  onToggleMenu: () => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ 
  goal,
  isMenuActive,
  onToggleMenu,
  onEdit,
  onDelete,
}) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remainingAmount = goal.targetAmount - goal.currentAmount;
  const daysRemaining = Math.ceil((goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const getProgressColor = () => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const menuActions = [
    {
      icon: 'create-outline',
      label: 'Edit',
      onPress: () => onEdit(goal),
      color: '#2563EB',
    },
    {
      icon: 'trash-outline',
      label: 'Delete',
      onPress: () => onDelete(goal.id),
      color: '#EF4444',
    },
  ];

  return (
    <View className="bg-white rounded-xl shadow-sm border border-neutral-100">
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-lg font-bold text-neutral-900">
              {goal.name}
            </Text>
            <View className="flex-row items-center mt-1 space-x-3">
              <View className="px-2 py-1 bg-neutral-100 rounded">
                <Text className="text-xs text-neutral-600 capitalize">{goal.priority} Priority</Text>
              </View>
              <View className="px-2 py-1 bg-neutral-100 rounded">
                <Text className="text-xs text-neutral-600 capitalize">{goal.category}</Text>
              </View>
              <Text className="text-xs text-neutral-500">
                {daysRemaining} days left
              </Text>
            </View>
          </View>
          
          <MenuToggle
            isActive={isMenuActive}
            onToggle={onToggleMenu}
            actions={menuActions}
          />
        </View>

        <View className="mt-4">
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-neutral-500">Progress</Text>
            <Text className="text-sm font-medium text-neutral-700">
              {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
            </Text>
          </View>
          
          <View className="h-2 bg-neutral-100 rounded-full overflow-hidden">
            <View 
              className={`h-full ${getProgressColor()}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </View>
          
          <View className="flex-row justify-between mt-1">
            <Text className="text-xs text-neutral-500">
              {progress.toFixed(1)}% Complete
            </Text>
            <Text className="text-xs text-neutral-500">
              {formatCurrency(remainingAmount)} remaining
            </Text>
          </View>
        </View>

        {goal.notes && (
          <Text className="text-sm text-neutral-500 mt-3 bg-neutral-50 p-2 rounded">
            {goal.notes}
          </Text>
        )}
      </View>
    </View>
  );
};
