import React from 'react';
import { View } from 'react-native';

interface SimpleProgressProps {
  current: number;
  target: number;
  color?: string;
}

export const SimpleProgress: React.FC<SimpleProgressProps> = ({
  current,
  target,
  color = '#10B981'
}) => {
  const progress = Math.min(Math.max((current / target) * 100, 0), 100);

  return (
    <View className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
      <View 
        className="h-full rounded-full"
        style={{
          width: `${progress}%`,
          backgroundColor: color
        }}
      />
    </View>
  );
};
