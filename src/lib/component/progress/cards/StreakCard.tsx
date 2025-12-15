import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../core/Card';
import { AppColors } from '../../../theme/colors';

interface StreakCardProps {
  loggingStreak: number;
}

export const StreakCard: React.FC<StreakCardProps> = ({ loggingStreak }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Icon name="fire" size={24} color="#FF9500" />
        <Text style={styles.title}>Logging Streak</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.streakContainer}>
          <Text style={styles.streakValue}>{loggingStreak}</Text>
          <Text style={styles.streakLabel}>days</Text>
        </View>
        {loggingStreak > 0 && (
          <View style={styles.statusContainer}>
            <Icon name="check-circle" size={24} color={AppColors.success} />
            <Text style={styles.statusText}>Active Streak</Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakContainer: {
    alignItems: 'flex-start',
  },
  streakValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF9500',
    fontVariant: ['tabular-nums'],
  },
  streakLabel: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
    marginTop: 4,
  },
});
