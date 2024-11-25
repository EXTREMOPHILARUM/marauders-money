import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface SummaryCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    percentage: number;
  };
  colorScheme?: 'primary' | 'success' | 'danger' | 'info';
  type?: 'investment' | 'budget' | 'account' | 'goal';
  additionalInfo?: {
    label: string;
    value: string;
  };
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

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  change,
  type = 'account',
  colorScheme: explicitColorScheme,
  additionalInfo,
}) => {
  const getColorScheme = () => {
    if (explicitColorScheme) return explicitColorScheme;
    
    // Extract numeric value from the formatted string (removing currency symbols and commas)
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    
    // Show primary color if main value is 0

    if (numericValue == 0) return 'primary';
    
    if (!change) return 'info';

    switch (type) {
      case 'investment':
        return change.value >= 0 ? 'success' : 'danger';
      case 'budget':
        return change.value <= 100 ? 'success' : 'danger';
      case 'account':
        return change.value >= 0 ? 'success' : 'danger';
      case 'goal':
        return change.value >= 0 ? 'success' : 'danger';
      default:
        return 'primary';
    }
  };

  const formatPercentage = (percentage: number) => {
    if (isNaN(percentage) || !isFinite(percentage)) {
      return '0.00';
    }
    return percentage.toFixed(2);
  };

  const colors = colorSchemes[getColorScheme()];
  const config = typeConfig[type];

  return (
    <View className="mx-4 mb-6">
      <View className={`${colors.background} rounded-2xl p-6 shadow-lg`}>
        <View className="flex-row items-center mb-2">
          <Ionicons name={config.icon} size={20} color="white" className="opacity-80" />
          <Text className={`${colors.subtext} text-sm ml-2`}>{title}</Text>
        </View>
        
        <Text className={`${colors.text} text-4xl font-bold mb-2`}>
          {value}
        </Text>

        {additionalInfo && (
          <Text className={`${colors.subtext} text-sm mb-2`}>
            {additionalInfo.label}: {additionalInfo.value}
          </Text>
        )}
        
        {change && (
          <View className="mt-2">
            <Text className={`${colors.subtext} text-sm mb-1`}>
              {config.changeLabel}
            </Text>
            <View className="flex-row items-center">
              <View className={`flex-row items-center bg-white/20 rounded-full px-3 py-1`}>
                <Text className={`${colors.text} text-sm`}>
                  {change.value >= 0 ? config.positiveIndicator : config.negativeIndicator}
                  {Math.abs(change.value).toFixed(2)} ({formatPercentage(change.percentage)}%)
                </Text>
              </View>
            </View>

            {(type === 'budget' || type === 'goal') && (
              <View className="mt-3">
                <View className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <View 
                    className={`h-full ${
                      change.percentage === 0 
                        ? 'bg-white/50' 
                        : change.percentage > 100 
                          ? 'bg-red-400' 
                          : 'bg-white'
                    }`}
                    style={{ width: `${Math.min(change.percentage, 100)}%` }}
                  />
                </View>
                <View className="flex-row justify-between mt-1">
                  <Text className={`${colors.subtext} text-xs`}>0%</Text>
                  <Text className={`${colors.subtext} text-xs`}>100%</Text>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};
