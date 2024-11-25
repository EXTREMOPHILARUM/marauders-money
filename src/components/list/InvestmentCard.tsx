import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MenuToggle } from '../common/MenuToggle';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/formatters';

interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: number;
}

interface InvestmentCardProps {
  investment: Investment;
  isMenuActive: boolean;
  onToggleMenu: () => void;
  onEdit: (investment: Investment) => void;
  onDelete: (id: string) => void;
}

export const InvestmentCard: React.FC<InvestmentCardProps> = ({
  investment,
  isMenuActive,
  onToggleMenu,
  onEdit,
  onDelete,
}) => {
  const currentValue = investment.currentPrice * investment.quantity;
  const purchaseValue = investment.purchasePrice * investment.quantity;
  const gain = currentValue - purchaseValue;
  const gainPercentage = ((currentValue / purchaseValue) - 1) * 100;

  const menuActions = [
    {
      icon: 'create-outline',
      label: 'Edit',
      onPress: () => onEdit(investment),
      color: '#2563EB',
    },
    {
      icon: 'trash-outline',
      label: 'Delete',
      onPress: () => onDelete(investment.id),
      color: '#EF4444',
    },
  ];

  return (
    <Card>
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-neutral-900">{investment.symbol}</Text>
              <View className="ml-2 px-2 py-1 bg-neutral-100 rounded">
                <Text className="text-xs text-neutral-600 capitalize">{investment.type}</Text>
              </View>
            </View>
            <Text className="text-sm text-neutral-500 mt-1">{investment.name}</Text>
          </View>
          
          <MenuToggle
            isActive={isMenuActive}
            onToggle={onToggleMenu}
            actions={menuActions}
          />
        </View>

        <View className="flex-row justify-between items-end mt-3">
          <View>
            <Text className="text-sm text-neutral-500">Current Value</Text>
            <Text className="text-lg font-bold text-neutral-900">
              {formatCurrency(currentValue)}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-sm text-neutral-500">Total Gain/Loss</Text>
            <View className="flex-row items-center">
              <Text className={`text-lg font-bold ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
              </Text>
              <Text className={`text-sm ml-1 ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ({gain >= 0 ? '+' : ''}{gainPercentage.toFixed(2)}%)
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between mt-3 pt-3 border-t border-neutral-100">
          <View className="flex-row">
            <Text className="text-sm text-neutral-500">
              {investment.quantity} shares @ {formatCurrency(investment.purchasePrice)}
            </Text>
          </View>
          <Text className="text-sm text-neutral-500">
            {formatDate(investment.purchaseDate)}
          </Text>
        </View>
      </View>
    </Card>
  );
};
