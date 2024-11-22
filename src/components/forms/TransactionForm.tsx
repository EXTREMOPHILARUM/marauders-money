import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CurrencyInput } from '../form/CurrencyInput';
import { DateInput } from '../form/DateInput';

interface TransactionFormData {
  amount: string;
  description: string;
  category: string;
  date: Date;
  type: 'income' | 'expense';
}

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  initialData?: Partial<TransactionFormData>;
  isLoading?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: initialData?.amount || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    date: initialData?.date || new Date(),
    type: initialData?.type || 'expense',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TransactionFormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TransactionFormData, string>> = {};

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    }
    if (!formData.description) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
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
      <CurrencyInput
        label="Amount"
        value={formData.amount}
        onChangeValue={(value) => setFormData({ ...formData, amount: value })}
        error={errors.amount}
      />

      <Input
        label="Description"
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        error={errors.description}
        placeholder="Enter description"
      />

      <Input
        label="Category"
        value={formData.category}
        onChangeText={(text) => setFormData({ ...formData, category: text })}
        error={errors.category}
        placeholder="Enter category"
      />

      <DateInput
        label="Date"
        value={formData.date}
        onChange={(date) => setFormData({ ...formData, date })}
      />

      <View style={styles.typeContainer}>
        <Button
          title="Expense"
          variant={formData.type === 'expense' ? 'primary' : 'outline'}
          onPress={() => setFormData({ ...formData, type: 'expense' })}
          style={styles.typeButton}
        />
        <Button
          title="Income"
          variant={formData.type === 'income' ? 'primary' : 'outline'}
          onPress={() => setFormData({ ...formData, type: 'income' })}
          style={styles.typeButton}
        />
      </View>

      <Button
        title="Save Transaction"
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
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  typeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});
