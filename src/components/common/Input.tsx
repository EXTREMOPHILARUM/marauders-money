import React, { forwardRef } from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <View className={className}>
        {label && (
          <Text className="text-sm font-medium text-neutral-700 mb-1">
            {label}
          </Text>
        )}
        <View className={`
          flex-row items-center
          border rounded-lg bg-white
          ${error ? 'border-danger-500' : 'border-neutral-200'}
        `}>
          {leftIcon && <View className="pl-3">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={`
              flex-1 py-3 px-4 text-base text-neutral-900
              ${leftIcon ? 'pl-2' : ''}
              ${rightIcon ? 'pr-2' : ''}
            `}
            placeholderTextColor="#94a3b8"
            {...props}
          />
          {rightIcon && <View className="pr-3">{rightIcon}</View>}
        </View>
        {error && (
          <Text className="text-xs text-danger-500 mt-1">
            {error}
          </Text>
        )}
      </View>
    );
  }
);
