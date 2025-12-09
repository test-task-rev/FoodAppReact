import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MealCard } from './MealCard';
import { MealType } from '../../types/MealType';
import { FoodLog } from '../../types/FoodLog';

interface MealContainerProps {
  mealLogs: Record<MealType, FoodLog[]>;
  onAddFood: (mealType: MealType) => void;
  onDeleteFood: (mealType: MealType, log: FoodLog) => void;
  onEditFood: (log: FoodLog) => void;
}

export const MealContainer: React.FC<MealContainerProps> = ({
  mealLogs,
  onAddFood,
  onDeleteFood,
  onEditFood,
}) => {

  const mealTypes = [MealType.Breakfast, MealType.Lunch, MealType.Dinner, MealType.Snack];

  return (
    <View style={styles.container}>
      {mealTypes.map(mealType => (
        <MealCard
          key={mealType}
          mealType={mealType}
          foodLogs={mealLogs[mealType]}
          onAddFood={() => onAddFood(mealType)}
          onDeleteFood={(log) => onDeleteFood(mealType, log)}
          onEditFood={onEditFood}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
});
