import React, { useState } from 'react';
import { Platform, Pressable } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Input } from '../common/Input';

interface DateInputProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  error?: string;
  format?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  label,
  error,
  format = 'MM/dd/yyyy',
}) => {
  const [show, setShow] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const showDatepicker = () => {
    setShow(true);
  };

  return (
    <>
      <Pressable onPress={showDatepicker}>
        <Input
          label={label}
          error={error}
          value={formatDate(value)}
          editable={false}
          pointerEvents="none"
        />
      </Pressable>

      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </>
  );
};
