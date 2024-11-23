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
  ({ value, onChangeValue, currency = 'INR', ...props }, ref) => {
    const formatCurrency = useCallback(
      (text: string) => {
        // Remove all non-digit characters
        const numbers = text.replace(/[^\d.]/g, '');
        
        // Convert to number, handling both whole numbers and decimals
        let decimal = parseFloat(numbers);
        if (isNaN(decimal)) decimal = 0;
        
        // Format as currency using Indian locale and INR currency
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(decimal);
      },
      [currency]
    );

    const handleChangeText = (text: string) => {
      // Allow digits, single decimal point, and currency symbols
      if (/^[\d.,\s]*$/.test(text.replace(/[₹$€£¥]/g, ''))) {
        // Remove currency symbols and extra spaces
        const cleanText = text.replace(/[₹$€£¥\s]/g, '');
        
        // Ensure only one decimal point
        const parts = cleanText.split('.');
        if (parts.length > 2) {
          return;
        }
        
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
