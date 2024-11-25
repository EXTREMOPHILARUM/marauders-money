import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatCurrency, absoluteCurrency, isZeroCurrency } from '../../utils/currency';

interface SummaryCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    percentage: number;
  };
  colorScheme?: 'primary' | 'success' | 'danger' | 'info';
  type?: 'investment' | 'budget' | 'account' | 'goal' | 'networth';
  additionalInfo?: {
    label: string;
    value: string | number;
  };
  showIcon?: boolean;
  customIcon?: string;
  currencyCode?: string;
}

const colorSchemes = {
  primary: {
    background: 'bg-primary-600',
    text: 'text-white',
    subtext: 'text-white/80',
  },
  success: {
    background: 'bg-green-600',
    text: 'text-white',
    subtext: 'text-white/80',
  },
  danger: {
    background: 'bg-red-600',
    text: 'text-white',
    subtext: 'text-white/80',
  },
  info: {
    background: 'bg-blue-600',
    text: 'text-white',
    subtext: 'text-white/80',
  },
};

const typeConfig = {
  networth: {
    icon: 'wallet',
    changeLabel: 'Total Investments',
    positiveIndicator: '+',
    negativeIndicator: '-',
  },
  investment: {
    icon: 'trending-up-outline',
    changeLabel: 'Total Gain/Loss',
    positiveIndicator: '+',
    negativeIndicator: '-',
  },
  budget: {
    icon: 'wallet-outline',
    changeLabel: 'Spent',
    positiveIndicator: '',
    negativeIndicator: '',
    showProgressBar: true,
  },
  account: {
    icon: 'cash-outline',
    changeLabel: 'Monthly Change',
    positiveIndicator: '+',
    negativeIndicator: '-',
  },
  goal: {
    icon: 'flag-outline',
    changeLabel: 'Target Amount',
    positiveIndicator: '',
    negativeIndicator: '',
    showProgressBar: true,
  },
};

const formatPercentage = (value: number): string => {
  if (isNaN(value) || !isFinite(value)) return '0.0';
  return value.toFixed(1);
};

const formatChangeValue = (value: number, currencyCode?: string): string => {
  if (isNaN(value) || !isFinite(value)) return formatCurrency(0, currencyCode);
  return formatCurrency(absoluteCurrency(value), currencyCode);
};

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  change,
  type = 'account',
  colorScheme: explicitColorScheme,
  additionalInfo,
  showIcon = true,
  customIcon,
  currencyCode,
}) => {
  const config = typeConfig[type];
  const colorScheme = explicitColorScheme || getColorScheme(type, value, change);
  const scheme = colorSchemes[colorScheme];

  // Format the main value
  const formattedValue = typeof value === 'number' 
    ? !isNaN(value) && isFinite(value)
      ? formatCurrency(value, currencyCode)
      : formatCurrency(0, currencyCode)
    : value;

  // Format additional info value if it's a number
  const formattedAdditionalValue = additionalInfo && typeof additionalInfo.value === 'number'
    ? !isNaN(additionalInfo.value) && isFinite(additionalInfo.value)
      ? formatCurrency(additionalInfo.value, currencyCode)
      : formatCurrency(0, currencyCode)
    : additionalInfo?.value;

  return (
    <View className={`${scheme.background} p-4 rounded-xl`}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          {showIcon && (
            <View className="mr-2">
              <Ionicons 
                name={customIcon || config.icon} 
                size={24} 
                color="white" 
              />
            </View>
          )}
          <Text className={`${scheme.text} text-lg font-medium`}>{title}</Text>
        </View>
      </View>

      <Text className={`${scheme.text} text-2xl font-bold mb-1`}>{formattedValue}</Text>

      {change && (
        <View className="flex-row items-center justify-between">
          <View>
            <Text className={`${scheme.subtext} text-sm`}>{config.changeLabel}</Text>
            <Text className={`${scheme.text} text-base font-medium`}>
              {!isNaN(change.value) && isFinite(change.value) && change.value >= 0 
                ? config.positiveIndicator 
                : config.negativeIndicator}
              {formatChangeValue(change.value, currencyCode)}
              {change.percentage !== undefined && 
                ` (${formatPercentage(change.percentage)}%)`}
            </Text>
          </View>
          {additionalInfo && (
            <View>
              <Text className={`${scheme.subtext} text-sm`}>{additionalInfo.label}</Text>
              <Text className={`${scheme.text} text-base font-medium`}>
                {formattedAdditionalValue}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const getColorScheme = (
  type: string, 
  value: string | number, 
  change?: { value: number }
) => {
  // Extract numeric value if it's a string
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.-]+/g, ''))
    : value;
  
  if (isNaN(numericValue) || !isFinite(numericValue) || isZeroCurrency(numericValue)) {
    return 'primary';
  }

  if (!change || isNaN(change.value) || !isFinite(change.value)) {
    return 'info';
  }

  switch (type) {
    case 'networth':
    case 'investment':
      return change.value >= 0 ? 'success' : 'danger';
    case 'budget':
      return change.value <= 100 ? 'success' : 'danger';
    case 'account':
      return change.value >= 0 ? 'success' : 'danger';
    case 'goal':
      return change.value >= 100 ? 'success' : 'danger';
    default:
      return 'primary';
  }
};
