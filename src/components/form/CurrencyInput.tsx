import React, { forwardRef, useCallback } from 'react';
import { TextInput } from 'react-native';
import { Input } from '../common/Input';

interface CurrencyInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  label?: string;
  error?: string;
  currency?: string;
  placeholder?: string;
}

export const CurrencyInput = forwardRef<TextInput, CurrencyInputProps>(
  ({ value, onChangeValue, currency = 'USD', ...props }, ref) => {
    const formatCurrency = useCallback(
      (text: string) => {
        // Remove all non-digit characters
        const numbers = text.replace(/[^\d]/g, '');
        
        // Convert to decimal
        const decimal = (parseInt(numbers) || 0) / 100;
        
        // Format as currency
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(decimal);
      },
      [currency]
    );

    const handleChangeText = (text: string) => {
      // Only update if we have a valid number
      if (/^[\d.,\s]*$/.test(text.replace(/[$€£¥]/g, ''))) {
        onChangeValue(text);
      }
    };

    return (
      <Input
        ref={ref}
        keyboardType="numeric"
        value={value}
        onChangeText={handleChangeText}
        onBlur={() => onChangeValue(formatCurrency(value))}
        {...props}
      />
    );
  }
);
