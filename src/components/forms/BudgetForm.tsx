import React, { useState } from 'react';
import { View } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CurrencyInput } from '../form/CurrencyInput';
import { DateInput } from '../form/DateInput';

interface BudgetFormData {
  name: string;
  amount: string;
  category: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  notes?: string;
}

interface BudgetFormProps {
  onSubmit: (data: Omit<BudgetFormData & { amount: number }, 'id'>) => void;
  initialData?: Partial<BudgetFormData>;
  isLoading?: boolean;
  editBudget?: boolean;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  editBudget = false,
}) => {
  const [formData, setFormData] = useState<BudgetFormData>({
    name: initialData?.name || '',
    amount: initialData?.amount?.toString() || '',
    category: initialData?.category || '',
    period: initialData?.period || 'monthly',
    startDate: initialData?.startDate ? new Date(initialData.startDate) : new Date(),
    endDate: initialData?.endDate ? new Date(initialData.endDate) : new Date(new Date().setMonth(new Date().getMonth() + 1)),
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BudgetFormData, string>>>({});

  const periodTypes: Array<BudgetFormData['period']> = [
    'daily',
    'weekly',
    'monthly',
    'yearly',
  ];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BudgetFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }
    
    const numericAmount = formData.amount ? parseFloat(formData.amount.replace(/[^0-9.-]+/g, '')) : 0;
    if (!formData.amount || formData.amount.trim() === '') {
      newErrors.amount = 'Budget amount is required';
    } else if (isNaN(numericAmount)) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (numericAmount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (formData.endDate <= formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const numericAmount = parseFloat(formData.amount.replace(/[^0-9.-]+/g, ''));
      onSubmit({
        name: formData.name.trim(),
        amount: numericAmount,
        category: formData.category.trim(),
        period: formData.period,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes?.trim(),
      });
    }
  };

  return (
    <View className="p-4">
      <Input
        label="Budget Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        error={errors.name}
        placeholder="Enter budget name"
        className="mb-4"
      />

      <CurrencyInput
        label="Budget Amount"
        value={formData.amount}
        onChangeValue={(value) => setFormData({ ...formData, amount: value })}
        error={errors.amount}
        className="mb-4"
      />

      <Input
        label="Category"
        value={formData.category}
        onChangeText={(text) => setFormData({ ...formData, category: text })}
        error={errors.category}
        placeholder="Enter category (e.g., Groceries, Utilities)"
        className="mb-4"
      />

      <View className="mb-4">
        <View className="flex-row flex-wrap gap-2">
          {periodTypes.map((period) => (
            <Button
              key={period}
              title={period.charAt(0).toUpperCase() + period.slice(1)}
              variant={formData.period === period ? 'primary' : 'outline'}
              onPress={() => setFormData({ ...formData, period })}
              className="px-3 py-1"
              size="small"
            />
          ))}
        </View>
      </View>

      <View className="flex-row gap-4 mb-4">
        <View className="flex-1">
          <DateInput
            label="Start Date"
            value={formData.startDate}
            onChange={(date) => setFormData({ ...formData, startDate: date })}
            error={undefined}
          />
        </View>
        <View className="flex-1">
          <DateInput
            label="End Date"
            value={formData.endDate}
            onChange={(date) => setFormData({ ...formData, endDate: date })}
            error={errors.endDate}
          />
        </View>
      </View>

      <Input
        label="Notes"
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        placeholder="Add any additional notes"
        multiline
        numberOfLines={3}
        className="mb-6 h-[80px]"
        textAlignVertical="top"
      />

      <Button
        title={editBudget ? "Update Budget" : "Save Budget"}
        onPress={handleSubmit}
        loading={isLoading}
        variant="primary"
        className="w-full bg-primary-600 active:bg-primary-700 disabled:opacity-50"
        disabled={isLoading}
      />
    </View>
  );
};
