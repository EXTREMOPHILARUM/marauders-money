import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CurrencyInput } from '../form/CurrencyInput';
import { DateInput } from '../form/DateInput';

interface BudgetFormData {
  name: string;
  amount: string;
  category: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

interface BudgetFormProps {
  onSubmit: (data: BudgetFormData) => void;
  initialData?: Partial<BudgetFormData>;
  isLoading?: boolean;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<BudgetFormData>({
    name: initialData?.name || '',
    amount: initialData?.amount || '',
    category: initialData?.category || '',
    startDate: initialData?.startDate || new Date(),
    endDate: initialData?.endDate || new Date(new Date().setMonth(new Date().getMonth() + 1)),
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BudgetFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BudgetFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }
    if (!formData.amount) {
      newErrors.amount = 'Budget amount is required';
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
      onSubmit(formData);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Budget Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        error={errors.name}
        placeholder="Enter budget name"
      />

      <CurrencyInput
        label="Budget Amount"
        value={formData.amount}
        onChangeValue={(value) => setFormData({ ...formData, amount: value })}
        error={errors.amount}
      />

      <Input
        label="Category"
        value={formData.category}
        onChangeText={(text) => setFormData({ ...formData, category: text })}
        error={errors.category}
        placeholder="Enter category"
      />

      <View style={styles.dateContainer}>
        <View style={styles.dateField}>
          <DateInput
            label="Start Date"
            value={formData.startDate}
            onChange={(date) => setFormData({ ...formData, startDate: date })}
          />
        </View>
        <View style={styles.dateField}>
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
        style={styles.notesInput}
      />

      <Button
        title="Save Budget"
        onPress={handleSubmit}
        loading={isLoading}
        fullWidth
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 8,
  },
  dateField: {
    flex: 1,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});
