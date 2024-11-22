import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { CurrencyInput } from '../form/CurrencyInput';
import { DateInput } from '../form/DateInput';

interface GoalFormData {
  name: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: Date;
  category: 'savings' | 'debt' | 'investment' | 'purchase';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

interface GoalFormProps {
  onSubmit: (data: GoalFormData) => void;
  initialData?: Partial<GoalFormData>;
  isLoading?: boolean;
}

export const GoalForm: React.FC<GoalFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<GoalFormData>({
    name: initialData?.name || '',
    targetAmount: initialData?.targetAmount || '',
    currentAmount: initialData?.currentAmount || '0',
    targetDate: initialData?.targetDate || new Date(new Date().setMonth(new Date().getMonth() + 6)),
    category: initialData?.category || 'savings',
    priority: initialData?.priority || 'medium',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GoalFormData, string>>>({});

  const categories: GoalFormData['category'][] = ['savings', 'debt', 'investment', 'purchase'];
  const priorities: GoalFormData['priority'][] = ['low', 'medium', 'high'];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof GoalFormData, string>> = {};
    const currentDate = new Date();

    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }
    if (!formData.targetAmount) {
      newErrors.targetAmount = 'Target amount is required';
    }
    if (formData.targetDate <= currentDate) {
      newErrors.targetDate = 'Target date must be in the future';
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
        label="Goal Name"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        error={errors.name}
        placeholder="Enter goal name"
      />

      <CurrencyInput
        label="Target Amount"
        value={formData.targetAmount}
        onChangeValue={(value) => setFormData({ ...formData, targetAmount: value })}
        error={errors.targetAmount}
      />

      <CurrencyInput
        label="Current Progress"
        value={formData.currentAmount}
        onChangeValue={(value) => setFormData({ ...formData, currentAmount: value })}
      />

      <DateInput
        label="Target Date"
        value={formData.targetDate}
        onChange={(date) => setFormData({ ...formData, targetDate: date })}
        error={errors.targetDate}
      />

      <View style={styles.sectionTitle}>
        <Text style={styles.label}>Category</Text>
      </View>
      <View style={styles.buttonGroup}>
        {categories.map((category) => (
          <Button
            key={category}
            title={category.charAt(0).toUpperCase() + category.slice(1)}
            variant={formData.category === category ? 'primary' : 'outline'}
            onPress={() => setFormData({ ...formData, category })}
            style={styles.categoryButton}
            size="small"
          />
        ))}
      </View>

      <View style={styles.sectionTitle}>
        <Text style={styles.label}>Priority</Text>
      </View>
      <View style={styles.buttonGroup}>
        {priorities.map((priority) => (
          <Button
            key={priority}
            title={priority.charAt(0).toUpperCase() + priority.slice(1)}
            variant={formData.priority === priority ? 'primary' : 'outline'}
            onPress={() => setFormData({ ...formData, priority })}
            style={[
              styles.priorityButton,
              {
                backgroundColor:
                  formData.priority === priority
                    ? priority === 'high'
                      ? '#DC2626'
                      : priority === 'medium'
                      ? '#F59E0B'
                      : '#10B981'
                    : 'transparent',
              },
            ]}
            size="small"
          />
        ))}
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
        title="Save Goal"
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
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    flex: 1,
    minWidth: '45%',
  },
  priorityButton: {
    flex: 1,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});
