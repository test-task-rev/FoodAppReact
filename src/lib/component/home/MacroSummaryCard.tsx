import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import { Card } from '../core/Card';
import { RING_SIZES, STROKE_WIDTHS, ICON_SIZES } from '../../theme/constants';

interface MacroSummaryCardProps {
  proteinConsumed: number;
  proteinGoal: number;
  carbsConsumed: number;
  carbsGoal: number;
  fatConsumed: number;
  fatGoal: number;
}

export const MacroSummaryCard: React.FC<MacroSummaryCardProps> = ({
  proteinConsumed,
  proteinGoal,
  carbsConsumed,
  carbsGoal,
  fatConsumed,
  fatGoal,
}) => {
  return (
    <Card>
      <View style={styles.header}>
        <Icon name="pizza" size={16} color="#007AFF" />
        <Text style={styles.headerText}>Macros</Text>
      </View>

      <View style={styles.ringsContainer}>
        <MacroRing
          name="Protein"
          value={proteinConsumed}
          goal={proteinGoal}
          color="#FF3B30"
          unit="g"
        />
        <MacroRing
          name="Carbs"
          value={carbsConsumed}
          goal={carbsGoal}
          color="#007AFF"
          unit="g"
        />
        <MacroRing
          name="Fat"
          value={fatConsumed}
          goal={fatGoal}
          color="#FF9500"
          unit="g"
        />
      </View>

      <View style={styles.remainingContainer}>
        <MacroRemainingRow
          name="Protein"
          remaining={Math.max(0, proteinGoal - proteinConsumed)}
          unit="g"
          color="#FF3B30"
        />
        <MacroRemainingRow
          name="Carbs"
          remaining={Math.max(0, carbsGoal - carbsConsumed)}
          unit="g"
          color="#007AFF"
        />
        <MacroRemainingRow
          name="Fat"
          remaining={Math.max(0, fatGoal - fatConsumed)}
          unit="g"
          color="#FF9500"
        />
      </View>
    </Card>
  );
};

interface MacroRingProps {
  name: string;
  value: number;
  goal: number;
  color: string;
  unit: string;
}

const MacroRing: React.FC<MacroRingProps> = ({
  name,
  value,
  goal,
  color,
  unit,
}) => {
  const ringSize = RING_SIZES.MEDIUM;
  const strokeWidth = STROKE_WIDTHS.MEDIUM_RING;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / goal, 1.0);

  return (
    <View style={styles.ringWrapper}>
      <View style={styles.ring}>
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
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            rotation="-90"
            origin={`${ringSize / 2}, ${ringSize / 2}`}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.ringCenter}>
          <Text style={styles.ringValue}>{Math.round(value)}</Text>
          <Text style={styles.ringUnit}>{unit}</Text>
        </View>
      </View>

      {/* Name below ring */}
      <Text style={styles.ringName}>{name}</Text>
    </View>
  );
};

interface MacroRemainingRowProps {
  name: string;
  remaining: number;
  unit: string;
  color: string;
}

const MacroRemainingRow: React.FC<MacroRemainingRowProps> = ({
  name,
  remaining,
  unit,
  color,
}) => {
  return (
    <View style={styles.remainingRow}>
      <View style={styles.remainingLeft}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.remainingName}>{name}</Text>
      </View>
      <Text style={styles.remainingText}>
        {Math.round(remaining)}{unit} left
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  ringsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  ringWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  ring: {
    position: 'relative',
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  ringUnit: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  ringName: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 8,
  },
  remainingContainer: {
    gap: 4,
  },
  remainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  remainingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  remainingName: {
    fontSize: 12,
    color: '#8E8E93',
  },
  remainingText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
