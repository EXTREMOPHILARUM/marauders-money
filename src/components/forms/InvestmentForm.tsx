import React, { useState } from 'react';
import { View } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CurrencyInput } from '../form/CurrencyInput';
import { DateInput } from '../form/DateInput';

interface InvestmentFormData {
  name: string;
  symbol: string;
  type: 'stock' | 'bond' | 'crypto' | 'other';
  quantity: string;
  purchasePrice: string;
  currentPrice: string;
  purchaseDate: Date;
}

interface InvestmentFormProps {
  onSubmit: (data: Omit<InvestmentFormData & { 
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
  }, 'id'>) => void;
  initialData?: Partial<InvestmentFormData>;
  isLoading?: boolean;
  isEditMode?: boolean;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  isEditMode = false,
}) => {
  const [formData, setFormData] = useState<InvestmentFormData>({
    name: initialData?.name || '',
    symbol: initialData?.symbol || '',
    type: initialData?.type || 'stock',
    quantity: initialData?.quantity?.toString() || '',
    purchasePrice: initialData?.purchasePrice?.toString() || '',
    currentPrice: initialData?.currentPrice?.toString() || '',
    purchaseDate: initialData?.purchaseDate ? new Date(initialData.purchaseDate) : new Date(),
  });

  const [errors, setErrors] = useState<Partial<Record<keyof InvestmentFormData, string>>>({});

  const investmentTypes: Array<InvestmentFormData['type']> = [
    'stock',
    'bond',
    'crypto',
    'other',
  ];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof InvestmentFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Investment name is required';
    }
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }
    
    const quantity = parseFloat(formData.quantity);
    if (!formData.quantity || isNaN(quantity)) {
      newErrors.quantity = 'Valid quantity is required';
    } else if (quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    const purchasePrice = parseFloat(formData.purchasePrice.replace(/[^0-9.-]+/g, ''));
    if (!formData.purchasePrice || isNaN(purchasePrice)) {
      newErrors.purchasePrice = 'Valid purchase price is required';
    } else if (purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }

    const currentPrice = parseFloat(formData.currentPrice.replace(/[^0-9.-]+/g, ''));
    if (!formData.currentPrice || isNaN(currentPrice)) {
      newErrors.currentPrice = 'Valid current price is required';
    } else if (currentPrice < 0) {
      newErrors.currentPrice = 'Current price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const quantity = parseFloat(formData.quantity);
      const purchasePrice = parseFloat(formData.purchasePrice.replace(/[^0-9.-]+/g, ''));
      const currentPrice = parseFloat(formData.currentPrice.replace(/[^0-9.-]+/g, ''));

      onSubmit({
        name: formData.name.trim(),
        symbol: formData.symbol.trim().toUpperCase(),
        type: formData.type,
        quantity,
        purchasePrice,
        currentPrice,
        purchaseDate: formData.purchaseDate,
      });
    }
  };

  return (
    <View className="p-4">
      <Input
        label="Investment Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        error={errors.name}
        placeholder="Enter investment name"
        className="mb-4"
      />

      <Input
        label="Symbol"
        value={formData.symbol}
        onChangeText={(text) => setFormData({ ...formData, symbol: text.toUpperCase() })}
        error={errors.symbol}
        placeholder="Enter symbol (e.g., AAPL)"
        className="mb-4"
        autoCapitalize="characters"
      />

      <View className="flex-row flex-wrap gap-2 mb-4">
        {investmentTypes.map((type) => (
          <Button
            key={type}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
            variant={formData.type === type ? 'primary' : 'outline'}
            size="small"
            onPress={() => setFormData({ ...formData, type })}
          />
        ))}
      </View>

      <Input
        label="Quantity"
        value={formData.quantity}
        onChangeText={(text) => {
          if (/^\d*\.?\d*$/.test(text)) {
            setFormData({ ...formData, quantity: text });
          }
        }}
        error={errors.quantity}
        placeholder="Enter quantity"
        keyboardType="decimal-pad"
        className="mb-4"
      />

      <CurrencyInput
        label="Purchase Price"
        value={formData.purchasePrice}
        onChangeValue={(value) => setFormData({ ...formData, purchasePrice: value })}
        error={errors.purchasePrice}
        placeholder="Enter purchase price"
        className="mb-4"
      />

      <CurrencyInput
        label="Current Price"
        value={formData.currentPrice}
        onChangeValue={(value) => setFormData({ ...formData, currentPrice: value })}
        error={errors.currentPrice}
        placeholder="Enter current price"
        className="mb-4"
      />

      <DateInput
        label="Purchase Date"
        value={formData.purchaseDate}
        onChange={(date) => setFormData({ ...formData, purchaseDate: date })}
        error={errors.purchaseDate}
        className="mb-6"
      />

      <Button
        title={isEditMode ? 'Update Investment' : 'Add Investment'}
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading}
      />
    </View>
  );
};
