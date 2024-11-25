import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface AddItemButtonProps {
  onPress: () => void;
  icon?: string;
  label: string;
  className?: string;
}

export const AddItemButton: React.FC<AddItemButtonProps> = ({
  onPress,
  icon = 'add-circle-outline',
  label,
  className = '',
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`mx-4 mb-6 bg-primary-50 border-2 border-primary-600 border-dashed p-4 rounded-xl flex-row items-center justify-center ${className}`}
    >
      <Ionicons name={icon} size={24} color="#2563EB" />
      <Text className="text-primary-600 font-semibold ml-2">{label}</Text>
    </TouchableOpacity>
  );
};
