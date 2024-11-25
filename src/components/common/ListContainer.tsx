import React from 'react';
import { View, Text, ScrollView, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ListContainerProps {
  title?: string;
  children: React.ReactNode;
  refreshControl?: React.ReactNode;
  contentPadding?: number;
  className?: string;
}

export const ListContainer: React.FC<ListContainerProps> = ({
  title,
  children,
  refreshControl,
  contentPadding = 90,
  className = '',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className={`flex-1 ${className}`}
      contentContainerStyle={{
        paddingBottom: Platform.select({ 
          ios: insets.bottom + contentPadding, 
          android: contentPadding 
        })
      }}
      refreshControl={refreshControl}
    >
      {title && (
        <View className="px-4 pb-4">
          <Text className="text-xl font-bold text-neutral-900">{title}</Text>
        </View>
      )}
      {children}
    </ScrollView>
  );
};
