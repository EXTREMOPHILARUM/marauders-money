import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { formatCurrency } from '../../utils/currency';

interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
  showAmount?: boolean;
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  label,
  showAmount = true,
  color = '#2563EB',
  height = 12,
}) => {
  const progress = Math.min(Math.max(current / target, 0), 1);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withSpring(`${progress * 100}%`, {
        damping: 15,
        stiffness: 100,
      }),
    };
  });

  const formatAmount = (amount: number) => {
    return formatCurrency(amount);
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          {showAmount && (
            <Text style={styles.amount}>
              {formatAmount(current)} / {formatAmount(target)}
            </Text>
          )}
        </View>
      )}
      <View style={[styles.progressContainer, { height }]}>
        <Animated.View
          style={[
            styles.progressBar,
            progressStyle,
            { backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  amount: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 999,
  },
});
