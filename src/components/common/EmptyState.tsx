import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  iconSize?: number;
  iconColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  iconSize = 48,
  iconColor = '#94A3B8',
}) => {
  return (
    <View className="bg-white rounded-xl p-6 shadow-sm border border-neutral-100">
      <View className="items-center">
        <Ionicons name={icon} size={iconSize} color={iconColor} />
        <Text className="text-neutral-500 text-center mt-4 text-base">
          {title}
        </Text>
        <Text className="text-neutral-400 text-center mt-2 text-sm">
          {description}
        </Text>
      </View>
    </View>
  );
};
