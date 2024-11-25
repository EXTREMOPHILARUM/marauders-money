import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface MenuAction {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
}

interface MenuToggleProps {
  isActive: boolean;
  onToggle: () => void;
  actions: MenuAction[];
  menuPosition?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export const MenuToggle: React.FC<MenuToggleProps> = ({
  isActive,
  onToggle,
  actions,
  menuPosition = { top: 12, right: 4 },
}) => {
  return (
    <>
      <TouchableOpacity
        onPress={onToggle}
        className="p-2 -mr-2 -mt-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
      </TouchableOpacity>

      {isActive && (
        <View 
          className="absolute bg-white rounded-lg shadow-lg border border-neutral-200 z-10"
          style={{
            top: menuPosition.top,
            right: menuPosition.right,
            bottom: menuPosition.bottom,
            left: menuPosition.left,
          }}
        >
          {actions.map((action, index) => (
            <TouchableOpacity
              key={action.label}
              className={`flex-row items-center px-4 py-3 ${
                index < actions.length - 1 ? 'border-b border-neutral-100' : ''
              }`}
              onPress={() => {
                action.onPress();
                onToggle();
              }}
            >
              <Ionicons 
                name={action.icon} 
                size={20} 
                color={action.color || '#4B5563'} 
              />
              <Text 
                className={`ml-2 ${
                  action.textColor ? action.textColor : 'text-neutral-700'
                }`}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
};
