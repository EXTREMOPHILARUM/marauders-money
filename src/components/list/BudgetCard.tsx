import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MenuToggle } from '../common/MenuToggle';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent?: number;
  progress?: number;
  category: string;
  currency: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate: number;
  notes?: string;
}

interface BudgetCardProps {
  budget: Budget;
  isMenuActive: boolean;
  onToggleMenu: () => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
  formatCurrency: (amount: number) => string;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  isMenuActive,
  onToggleMenu,
  onEdit,
  onDelete,
  formatCurrency,
}) => {
  const menuActions = [
    {
      icon: 'create-outline',
      label: 'Edit',
      onPress: () => onEdit(budget),
      color: '#2563EB',
    },
    {
      icon: 'trash-outline',
      label: 'Delete',
      onPress: () => onDelete(budget.id),
      color: '#EF4444',
      textColor: 'text-red-600',
    },
  ];

  return (
    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
      <View className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
        <View className="space-y-2">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-lg font-bold text-neutral-900">{budget.name}</Text>
              <Text className="text-sm text-neutral-500">{budget.category}</Text>
            </View>
            <View className="items-end">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-neutral-900 mr-2">
                  {formatCurrency(budget.amount)}
                </Text>
                <MenuToggle
                  isActive={isMenuActive}
                  onToggle={onToggleMenu}
                  actions={menuActions}
                  menuPosition={{ top: 8, right: 0 }}
                />
              </View>
              <Text className="text-sm text-neutral-500">
                {formatCurrency(budget.spent || 0)} spent
              </Text>
            </View>
          </View>
          <View className="space-y-1">
            <View className="flex-row justify-between">
              <Text className="text-sm text-neutral-600">
                Spent: {formatCurrency(budget.spent || 0)}
              </Text>
              <Text className="text-sm text-neutral-600">
                {((budget.progress || 0)).toFixed(1)}%
              </Text>
            </View>
            <View className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
              <View 
                className="h-full bg-primary-600" 
                style={{ width: `${budget.progress || 0}%` }}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
