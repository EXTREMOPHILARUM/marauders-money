import React, { useState } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Input } from '../common/Input';

interface SelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: Array<{ label: string; value: string }>;
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onValueChange,
  items,
  error,
  placeholder = 'Select an option',
}) => {
  const [showModal, setShowModal] = useState(false);

  const selectedItem = items.find(item => item.value === value);
  const displayValue = selectedItem ? selectedItem.label : placeholder;

  return (
    <>
      <Pressable onPress={() => setShowModal(true)}>
        <Input
          label={label}
          value={displayValue}
          error={error}
          editable={false}
          pointerEvents="none"
          rightIcon={<Ionicons name="chevron-down" size={24} color="#6B7280" />}
        />
      </Pressable>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setShowModal(false)}
        >
          <Pressable
            className="bg-white rounded-t-xl"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">{label}</Text>
              <Pressable
                onPress={() => setShowModal(false)}
                className="p-2"
              >
                <Text className="text-primary-600">Done</Text>
              </Pressable>
            </View>

            <View className="p-2">
              {items.map((item) => (
                <Pressable
                  key={item.value}
                  onPress={() => {
                    onValueChange(item.value);
                    setShowModal(false);
                  }}
                  className={`
                    p-4 rounded-lg mb-1
                    ${item.value === value ? 'bg-primary-50' : 'bg-white'}
                  `}
                >
                  <Text
                    className={`
                      text-base
                      ${item.value === value ? 'text-primary-600 font-medium' : 'text-gray-700'}
                    `}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
