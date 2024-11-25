import React from 'react';
import { View, Text } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  count,
  countLabel = 'items',
}) => {
  return (
    <View className="px-4 pt-6 pb-4">
      <Text className="text-2xl font-bold text-neutral-900 mb-1">{title}</Text>
      {subtitle ? (
        <Text className="text-sm text-neutral-500">{subtitle}</Text>
      ) : count !== undefined ? (
        <Text className="text-sm text-neutral-500">
          {count} {count === 1 ? countLabel.replace(/s$/, '') : countLabel} total
        </Text>
      ) : null}
    </View>
  );
};
