import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MealType } from '../../types/MealType';
import { FoodLog } from '../../types/FoodLog';
import { Card } from '../core/Card';

interface MealCardProps {
  mealType: MealType;
  foodLogs?: FoodLog[];
  onAddFood: () => void;
  onDeleteFood?: (log: FoodLog) => void;
  onEditFood?: (log: FoodLog) => void;
}

export const MealCard: React.FC<MealCardProps> = ({
  mealType,
  foodLogs = [],
  onAddFood,
  onDeleteFood,
  onEditFood,
}) => {
  const getMealIcon = (): string => {
    switch (mealType) {
      case MealType.Breakfast:
        return 'sunny';
      case MealType.Lunch:
        return 'sunny-outline';
      case MealType.Dinner:
        return 'moon';
      case MealType.Snack:
        return 'time';
    }
  };

  const getMealDisplayName = (): string => {
    switch (mealType) {
      case MealType.Breakfast:
        return 'Breakfast';
      case MealType.Lunch:
        return 'Lunch';
      case MealType.Dinner:
        return 'Dinner';
      case MealType.Snack:
        return 'Snacks';
    }
  };

  const getTotalCalories = (): number => {
    return foodLogs.reduce((sum, log) => sum + (log.calories || 0), 0);
  };

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name={getMealIcon()} size={24} color="#007AFF" />
          <Text style={styles.mealName}>{getMealDisplayName()}</Text>
          {foodLogs.length > 0 && (
            <Text style={styles.calorieCount}>
              {Math.round(getTotalCalories())} cal
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={onAddFood} style={styles.addButton}>
          <Icon name="add-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {foodLogs.length > 0 && (
        <View style={styles.foodItemsContainer}>
          {foodLogs.map((log) => (
            <TouchableOpacity
              key={log.logId}
              style={styles.foodItem}
              onPress={() => onEditFood?.(log)}
            >
              <View style={styles.foodItemLeft}>
                <Text style={styles.foodItemName}>{log.foodName}</Text>
                <View style={styles.macrosRow}>
                  <Text style={styles.macroText}>P: {Math.round(log.protein)}g</Text>
                  <Text style={styles.macroText}>C: {Math.round(log.carbohydrates)}g</Text>
                  <Text style={styles.macroText}>F: {Math.round(log.fat)}g</Text>
                </View>
              </View>
              <View style={styles.foodItemRight}>
                <Text style={styles.foodItemCalories}>
                  {Math.round(log.calories)} cal
                </Text>
                {onDeleteFood && (
                  <TouchableOpacity
                    onPress={() => onDeleteFood(log)}
                    style={styles.deleteButton}
                  >
                    <Icon name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  calorieCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  addButton: {
    padding: 4,
  },
  foodItemsContainer: {
    marginTop: 12,
    gap: 8,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  foodItemLeft: {
    flex: 1,
    gap: 4,
  },
  foodItemName: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 12,
  },
  macroText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  foodItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  foodItemCalories: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  deleteButton: {
    padding: 4,
  },
});
