import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CurrencyInput } from '../form/CurrencyInput';
import { DateInput } from '../form/DateInput';
import { Select } from '../form/Select';

interface GoalFormData {
  name: string;
  targetAmount: string;
  currentAmount: string;
  deadline: Date;
  category: 'savings' | 'debt' | 'investment' | 'purchase' | 'emergency' | 'retirement';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface GoalFormProps {
  onSubmit: (data: Omit<GoalFormData & { targetAmount: number; currentAmount: number }, 'id' | 'status'>) => void;
  initialData?: Partial<GoalFormData>;
  isLoading?: boolean;
  isEditMode?: boolean;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  isEditMode = false,
}) => {
  const [formData, setFormData] = useState<GoalFormData>({
    name: initialData?.name || '',
    targetAmount: initialData?.targetAmount?.toString() || '',
    currentAmount: initialData?.currentAmount?.toString() || '0',
    deadline: initialData?.deadline ? new Date(initialData.deadline) : new Date(new Date().setMonth(new Date().getMonth() + 6)),
    category: initialData?.category || 'savings',
    priority: initialData?.priority || 'medium',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({});

  const categories: Array<{ label: string; value: GoalFormData['category'] }> = [
    { label: 'Savings', value: 'savings' },
    { label: 'Debt Repayment', value: 'debt' },
    { label: 'Investment', value: 'investment' },
    { label: 'Purchase', value: 'purchase' },
    { label: 'Emergency Fund', value: 'emergency' },
    { label: 'Retirement', value: 'retirement' },
  ];

  const priorities: Array<{ label: string; value: GoalFormData['priority'] }> = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof GoalFormData, string>> = {};
    const currentDate = new Date();

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }

    const targetAmount = formData.targetAmount ? parseFloat(formData.targetAmount.replace(/[^0-9.-]+/g, '')) : 0;
    if (!formData.targetAmount || formData.targetAmount.trim() === '') {
      newErrors.targetAmount = 'Target amount is required';
    } else if (isNaN(targetAmount)) {
      newErrors.targetAmount = 'Please enter a valid amount';
    } else if (targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    const currentAmount = formData.currentAmount ? parseFloat(formData.currentAmount.replace(/[^0-9.-]+/g, '')) : 0;
    if (isNaN(currentAmount)) {
      newErrors.currentAmount = 'Please enter a valid amount';
    } else if (currentAmount < 0) {
      newErrors.currentAmount = 'Current amount cannot be negative';
    } else if (currentAmount > targetAmount) {
      newErrors.currentAmount = 'Current amount cannot exceed target amount';
    }

    if (formData.deadline <= currentDate) {
      newErrors.deadline = 'Target date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const targetAmount = parseFloat(formData.targetAmount.replace(/[^0-9.-]+/g, ''));
      const currentAmount = parseFloat(formData.currentAmount.replace(/[^0-9.-]+/g, ''));
      
      onSubmit({
        name: formData.name.trim(),
        targetAmount,
        currentAmount,
        deadline: formData.deadline,
        category: formData.category,
        priority: formData.priority,
        notes: formData.notes?.trim(),
      });
    }
  };

  return (
    <View className="p-4">
      <Input
        label="Goal Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        error={errors.name}
        placeholder="Enter goal name"
        className="mb-4"
      />

      <CurrencyInput
        label="Target Amount"
        value={formData.targetAmount}
        onChangeValue={(value) => setFormData({ ...formData, targetAmount: value })}
        error={errors.targetAmount}
        className="mb-4"
      />

      <CurrencyInput
        label="Current Amount"
        value={formData.currentAmount}
        onChangeValue={(value) => setFormData({ ...formData, currentAmount: value })}
        error={errors.currentAmount}
        className="mb-4"
      />

      <DateInput
        label="Target Date"
        value={formData.deadline}
        onChange={(date) => setFormData({ ...formData, deadline: date })}
        error={errors.deadline}
        className="mb-4"
      />

      <Select
        label="Category"
        value={formData.category}
        onValueChange={(value) => setFormData({ ...formData, category: value })}
        items={categories}
        className="mb-4"
      />

      <View className="mb-4">
        <Text className="text-sm font-medium text-neutral-900 mb-2">Priority</Text>
        <View className="flex-row flex-wrap gap-2">
          {priorities.map((priority) => (
            <Button
              key={priority.value}
              title={priority.label}
              variant={formData.priority === priority.value ? 'primary' : 'outline'}
              onPress={() => setFormData({ ...formData, priority: priority.value })}
              className="px-3 py-1"
              size="small"
            />
          ))}
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
        title={isEditMode ? "Update Goal" : "Save Goal"}
        onPress={handleSubmit}
        loading={isLoading}
        variant="primary"
        className="w-full bg-primary-600 active:bg-primary-700 disabled:opacity-50"
        disabled={isLoading}
      />
    </View>
  );
};
