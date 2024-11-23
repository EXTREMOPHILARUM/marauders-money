import React from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    onToggleMenu();
                  }}
                  className="p-2"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
                </TouchableOpacity>
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
            {isMenuActive && (
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View className="absolute right-0 top-0 mt-8 bg-white rounded-lg shadow-lg border border-neutral-200 z-10">
                  <TouchableOpacity 
                    onPress={() => {
                      onEdit(budget);
                    }}
                    className="flex-row items-center px-4 py-3 border-b border-neutral-100"
                  >
                    <Ionicons name="pencil-outline" size={20} color="#2563EB" />
                    <Text className="text-neutral-700 ml-2">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => {
                      onDelete(budget.id);
                    }}
                    className="flex-row items-center px-4 py-3"
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text className="text-red-600 ml-2">Delete</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
