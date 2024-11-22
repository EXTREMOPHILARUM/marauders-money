import React, { useState } from 'react';
import { View } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CurrencyInput } from '../form/CurrencyInput';

interface AccountFormData {
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: string;
  currency: string;
  institution?: string;
  notes?: string;
}

interface AccountFormProps {
  onSubmit: (data: Omit<AccountFormData & { balance: number }, 'id' | 'lastUpdated'>) => void;
  initialData?: Partial<AccountFormData>;
  isLoading?: boolean;
}

export const AccountForm: React.FC<AccountFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<AccountFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'checking',
    balance: initialData?.balance || '',
    currency: initialData?.currency || 'USD',
    institution: initialData?.institution || '',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AccountFormData, string>>>({});

  const accountTypes: Array<AccountFormData['type']> = [
    'checking',
    'savings',
    'credit',
    'investment',
  ];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AccountFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }
    if (!formData.balance) {
      newErrors.balance = 'Initial balance is required';
    }
    if (!formData.type) {
      newErrors.type = 'Account type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        ...formData,
        balance: parseFloat(formData.balance.replace(/[^0-9.-]+/g, '')),
      });
    }
  };

  return (
    <View className="p-md bg-white">
      <Input
        label="Account Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        error={errors.name}
        placeholder="Enter account name"
        className="mb-md"
      />

      <View className="flex-row flex-wrap gap-sm mb-md">
        {accountTypes.map((type) => (
          <Button
            key={type}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
            variant={formData.type === type ? 'primary' : 'outline'}
            onPress={() => setFormData({ ...formData, type })}
            className="px-2 py-1"
            size="small"
          />
        ))}
      </View>

      <CurrencyInput
        label="Initial Balance"
        value={formData.balance}
        onChangeValue={(value) => setFormData({ ...formData, balance: value })}
        error={errors.balance}
        className="mb-md"
      />

      <Input
        label="Financial Institution"
        value={formData.institution}
        onChangeText={(text) => setFormData({ ...formData, institution: text })}
        placeholder="Enter bank or institution name"
        className="mb-md"
      />

      <Input
        label="Notes"
        value={formData.notes}
        onChangeText={(text) => setFormData({ ...formData, notes: text })}
        placeholder="Add any additional notes"
        multiline
        numberOfLines={3}
        className="mb-lg h-[80px]"
        textAlignVertical="top"
      />

      <Button
        title="Save Account"
        onPress={handleSubmit}
        loading={isLoading}
        variant="primary"
        className="w-full bg-primary-600 active:bg-primary-700"
      />
    </View>
  );
};
