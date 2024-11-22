import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  icon,
}) => {
  const getVariantClasses = () => {
    if (disabled) return 'bg-neutral-200 text-neutral-400';
    
    switch (variant) {
      case 'primary':
        return 'bg-primary-600 text-white active:bg-primary-700';
      case 'secondary':
        return 'bg-secondary-600 text-white active:bg-secondary-700';
      case 'outline':
        return 'bg-transparent border-2 border-primary-600 text-primary-600';
      case 'danger':
        return 'bg-danger-600 text-white active:bg-danger-700';
      default:
        return 'bg-primary-600 text-white active:bg-primary-700';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-2 px-4 text-sm';
      case 'large':
        return 'py-4 px-8 text-lg';
      default:
        return 'py-3 px-6 text-base';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        rounded-lg items-center justify-center
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      <View className="flex-row items-center justify-center">
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' ? '#2563eb' : '#ffffff'}
          />
        ) : (
          <>
            {icon && <View className="mr-2">{icon}</View>}
            <Text
              className={`
                font-semibold text-center
                ${disabled ? 'text-neutral-400' : variant === 'outline' ? 'text-primary-600' : 'text-white'}
              `}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
};
