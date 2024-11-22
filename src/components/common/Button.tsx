import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return styles.colors.disabled;
    switch (variant) {
      case 'primary':
        return styles.colors.primary;
      case 'secondary':
        return styles.colors.secondary;
      case 'outline':
        return 'transparent';
      case 'danger':
        return styles.colors.danger;
      default:
        return styles.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return styles.colors.disabledText;
    switch (variant) {
      case 'outline':
        return styles.colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  const getBorderStyle = () => {
    return variant === 'outline'
      ? { borderWidth: 2, borderColor: styles.colors.primary }
      : {};
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          opacity: pressed ? 0.8 : 1,
          width: fullWidth ? '100%' : 'auto',
          ...getPadding(),
          ...getBorderStyle(),
        },
      ]}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' ? styles.colors.primary : '#FFFFFF'}
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                styles.text,
                {
                  color: getTextColor(),
                  fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
                },
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  colors: {
    primary: '#2563EB',
    secondary: '#4B5563',
    danger: '#DC2626',
    disabled: '#E5E7EB',
    disabledText: '#9CA3AF',
  },
});
