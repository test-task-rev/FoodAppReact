import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import { Card } from '../core/Card';
import { RING_SIZES, STROKE_WIDTHS, ICON_SIZES } from '../../theme/constants';

interface CalorieSummaryCardProps {
  caloriesConsumed: number;
  caloriesBurned: number;
  calorieGoal: number;
}

export const CalorieSummaryCard: React.FC<CalorieSummaryCardProps> = ({
  caloriesConsumed,
  caloriesBurned,
  calorieGoal,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const netCalories = caloriesConsumed - caloriesBurned;
  const caloriesRemaining = calorieGoal - netCalories;
  const progress = Math.min(Math.max(netCalories / calorieGoal, 0), 1);

  const getRingColor = (): string => {
    if (progress < 0.8) return '#007AFF'; // Blue
    if (progress < 1.0) return '#FF9500'; // Orange
    return '#FF3B30'; // Red (over goal)
  };

  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: progress,
      useNativeDriver: true,
      damping: 10,
      stiffness: 100,
    }).start();
  }, [progress]);

  // Ring parameters
  const ringSize = RING_SIZES.LARGE;
  const strokeWidth = STROKE_WIDTHS.LARGE_RING;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <Card>
      <View style={styles.content}>
        {/* Left side: Food, Exercise, Goal */}
        <View style={styles.leftPanel}>
          <CalorieInfoRow
            icon="restaurant"
            label="Food"
            calories={caloriesConsumed}
            color="#007AFF"
          />
          <CalorieInfoRow
            icon="flame"
            label="Exercise"
            calories={caloriesBurned}
            color="#34C759"
          />
          <CalorieInfoRow
            icon="flag"
            label="Goal"
            calories={calorieGoal}
            color="#FF9500"
          />
        </View>

        {/* Right side: Circular Ring */}
        <View style={styles.ringContainer}>
          <Svg width={ringSize} height={ringSize}>
            {/* Background ring */}
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke="#E5E5EA"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress ring */}
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={getRingColor()}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              rotation="-90"
              origin={`${ringSize / 2}, ${ringSize / 2}`}
            />
          </Svg>

          <View style={styles.centerContent}>
            <Text style={styles.remainingNumber}>
              {Math.round(caloriesRemaining)}
            </Text>
            <Text style={styles.remainingLabel}>Remaining</Text>
          </View>
        </View>
      </View>

      {/* Daily Summary Button */}
      <TouchableOpacity
        style={styles.summaryButton}
        onPress={() => navigation.navigate('DailySummary')}
      >
        <Icon name="sparkles" size={ICON_SIZES.MINI} color="#007AFF" />
        <Text style={styles.summaryButtonText}>Daily Summary</Text>
        <View style={{ flex: 1 }} />
        <Icon name="chevron-forward" size={ICON_SIZES.MICRO} color="#8E8E93" />
      </TouchableOpacity>
    </Card>
  );
};

interface CalorieInfoRowProps {
  icon: string;
  label: string;
  calories: number;
  color: string;
}

const CalorieInfoRow: React.FC<CalorieInfoRowProps> = ({
  icon,
  label,
  calories,
  color,
}) => {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoHeader}>
        <Icon name={icon} size={ICON_SIZES.TINY} color={color} style={styles.infoIcon} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{Math.round(calories).toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftPanel: {
    flex: 1,
    gap: 16,
  },
  infoRow: {
    gap: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    width: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: '#000',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 28,
  },
  ringContainer: {
    position: 'relative',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  remainingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  remainingLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  summaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    marginTop: 16,
  },
  summaryButtonText: {
    fontSize: 14,
    color: '#000',
  },
});
