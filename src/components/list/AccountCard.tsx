import React from 'react';
import { Text, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

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

interface AccountCardProps {
  account: Account;
  isMenuActive: boolean;
  onToggleMenu: () => void;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
  formatCurrency: (value: number) => string;
  formatDate: (timestamp: number) => string;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  isMenuActive,
  onToggleMenu,
  onEdit,
  onDelete,
  formatCurrency,
  formatDate,
}) => {
  const { name, type, balance, lastUpdated, institution } = account;

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-neutral-900">{name}</Text>
          <Text className="text-sm text-neutral-500">{type}</Text>
          {institution && (
            <Text className="text-sm text-neutral-500">{institution}</Text>
          )}
        </View>
        <View className="flex-row items-center">
          <Text className="text-lg font-bold text-primary-600">
            {formatCurrency(balance)}
          </Text>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              onToggleMenu();
            }}
            className="ml-4 p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>
      <Text className="text-xs text-neutral-400">
        Last updated: {formatDate(lastUpdated)}
      </Text>
      {isMenuActive && (
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View className="absolute right-0 top-0 mt-12 bg-white rounded-lg shadow-lg border border-neutral-200 z-10">
            <TouchableOpacity 
              onPress={() => {
                onEdit(account);
                onToggleMenu();
              }}
              className="flex-row items-center px-4 py-3 border-b border-neutral-100"
            >
              <Ionicons name="pencil-outline" size={20} color="#2563EB" />
              <Text className="text-neutral-700 ml-2">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                onDelete(account.id);
                onToggleMenu();
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
  );
};
