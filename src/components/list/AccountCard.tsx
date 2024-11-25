import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MenuToggle } from '../common/MenuToggle';
import { Account } from '../../types/account';

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

  const menuActions = [
    {
      icon: 'create-outline',
      label: 'Edit',
      onPress: () => onEdit(account),
      color: '#2563EB',
    },
    {
      icon: 'trash-outline',
      label: 'Delete',
      onPress: () => onDelete(account.id),
      color: '#EF4444',
    },
  ];

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
          <MenuToggle
            isActive={isMenuActive}
            onToggle={onToggleMenu}
            actions={menuActions}
            menuPosition={{ top: 8, right: 0 }}
          />
        </View>
      </View>
      <Text className="text-xs text-neutral-400">
        Last updated: {formatDate(lastUpdated)}
      </Text>
    </View>
  );
};
