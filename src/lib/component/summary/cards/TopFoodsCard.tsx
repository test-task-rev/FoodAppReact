import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card } from '../../core/Card';
import { AppColors } from '../../../theme/colors';
import { TopFoodEntry } from '../../../types/DailySummary';

interface TopFoodsCardProps {
  foods: TopFoodEntry[];
}

interface TopFoodRowProps {
  food: TopFoodEntry;
}

const TopFoodRow: React.FC<TopFoodRowProps> = ({ food }) => {
  // Get meal type color
  const getMealTypeColor = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'breakfast':
        return '#FF9500';
      case 'lunch':
        return '#34C759';
      case 'dinner':
        return '#007AFF';
      case 'snack':
        return '#9B59B6';
      default:
        return AppColors.secondaryLabel;
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>{food.rank}</Text>
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName} numberOfLines={1}>
          {food.foodName}
        </Text>
        <View style={styles.detailsRow}>
          <View style={[styles.mealTypeBadge, { backgroundColor: getMealTypeColor(food.mealType) }]}>
            <Text style={styles.mealTypeText}>{food.mealType}</Text>
          </View>
          <Text style={styles.portion}>
            {food.portion} {food.unit}
          </Text>
        </View>
      </View>
      <Text style={styles.calories}>{Math.round(food.calories)} cal</Text>
    </View>
  );
};

export const TopFoodsCard: React.FC<TopFoodsCardProps> = ({ foods }) => {
  if (foods.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Icon name="trophy" size={20} color={AppColors.warning} />
          <Text style={styles.title}>Top 5 Foods</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="food-off" size={48} color={AppColors.tertiaryLabel} />
          <Text style={styles.emptyText}>No food logs for this day</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Icon name="trophy" size={20} color={AppColors.warning} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Top 5 Foods</Text>
          <Text style={styles.subtitle}>By Calories</Text>
        </View>
      </View>
      <View style={styles.list}>
        {foods.map((food) => (
          <TopFoodRow key={food.rank} food={food} />
        ))}
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
    gap: 8,
    marginBottom: 16,
  },
  headerTextContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
  },
  subtitle: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rank: {
    fontSize: 14,
    fontWeight: 'bold',
    color: AppColors.label,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.label,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mealTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  portion: {
    fontSize: 12,
    color: AppColors.secondaryLabel,
  },
  calories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.label,
    fontVariant: ['tabular-nums'],
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
  },
});
