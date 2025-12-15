import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../core/Card';
import { AppColors } from '../../../theme/colors';

interface AISummaryCardProps {
  summary: string | null;
  isLoading?: boolean;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ summary, isLoading = false }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Icon name="sparkles" size={20} color={AppColors.primary} />
        <Text style={styles.title}>Daily Insights</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={AppColors.primary} />
        </View>
      ) : summary ? (
        <Text style={styles.summaryText}>{summary}</Text>
      ) : (
        <Text style={styles.emptyText}>Not enough data to generate insights</Text>
      )}
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
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: AppColors.label,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
    fontStyle: 'italic',
  },
});
