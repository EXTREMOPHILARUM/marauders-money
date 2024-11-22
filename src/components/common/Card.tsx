import React from 'react';
import { View, ViewProps, Pressable } from 'react-native';

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

  const shadowStyle = {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1 + elevation * 0.03,
    shadowRadius: elevation * 0.8,
    elevation: elevation,
  };

  return (
    <CardContainer
      className="bg-white rounded-lg p-4 m-2"
      style={[shadowStyle, style]}
      onPress={onPress}
      {...props}
    >
      {children}
    </CardContainer>
  );
};
