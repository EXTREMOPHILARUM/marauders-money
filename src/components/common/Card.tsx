import React from 'react';
import { StyleSheet, View, ViewProps, Pressable } from 'react-native';

interface CardProps extends ViewProps {
  onPress?: () => void;
  elevation?: number;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  onPress,
  elevation = 1,
  style,
  children,
  ...props
}) => {
  const CardContainer = onPress ? Pressable : View;

  return (
    <CardContainer
      style={({ pressed }: { pressed?: boolean }) => [
        styles.card,
        {
          ...getShadow(elevation),
          opacity: pressed ? 0.95 : 1,
        },
        style,
      ]}
      onPress={onPress}
      {...props}
    >
      {children}
    </CardContainer>
  );
};

const getShadow = (elevation: number) => {
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1 + elevation * 0.03,
    shadowRadius: elevation * 0.8,
    elevation: elevation,
  };
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
});
