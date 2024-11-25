import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isSubmitting?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  visible,
  onClose,
  title,
  children,
  isSubmitting = false,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        if (!isSubmitting) {
          Keyboard.dismiss();
          onClose();
        }
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 bg-black/50 justify-end"
          onPress={() => {
            if (!isSubmitting) {
              Keyboard.dismiss();
              onClose();
            }
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="max-h-[90%]"
          >
            <ScrollView
              className="bg-white rounded-t-3xl"
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                <Text className="text-lg font-bold">{title}</Text>
                {!isSubmitting && (
                  <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
              {children}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};
