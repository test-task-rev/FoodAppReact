import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CalorieSummaryCard } from './CalorieSummaryCard';
import { MacroSummaryCard } from './MacroSummaryCard';
import { WeightCard } from './WeightCard';
import { WaterCard } from './WaterCard';
import { MealContainer } from './MealContainer';
import { ExerciseCard } from './ExcerciseCard';
import { AddExerciseModal } from '../modals/AddExerciseModal';
import { WeekCalendar } from '../calendar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useExerciseData } from '../../hooks/useExerciseData';
import { useWaterData } from '../../hooks/useWaterData';
import { useWeightData } from '../../hooks/useWeightData';
import { useFoodLog } from '../../hooks/useFoodLog';
import { MealType } from '../../types/MealType';
import { FoodLog } from '../../types/FoodLog';
import { FoodLogModal } from '../modals/FoodLogModal';
import { useProfile } from '../../hooks/ProfileProvider';

const { width: screenWidth } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [selectedFoodLog, setSelectedFoodLog] = useState<FoodLog | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();
  const { getGoalForDate, getUnitSystem } = useProfile();

  const exerciseData = useExerciseData({ selectedDate });
  const waterData = useWaterData({ selectedDate });
  const weightData = useWeightData();
  const {
    mealLogs,
    isLoading: isFoodLoading,
    error: foodError,
    setSelectedDate: setFoodDate,
    deleteFoodLog,
    getTotalCalories,
    getTotalMacros,
    clearError: clearFoodError,
  } = useFoodLog();

  useEffect(() => {
    setFoodDate(selectedDate);
  }, [selectedDate, setFoodDate]);

  useEffect(() => {
    if (foodError) {
      Alert.alert('Error', foodError, [
        { text: 'OK', onPress: () => clearFoodError() }
      ]);
    }
  }, [foodError]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentCardIndex(index);
  };

  const handleAddExercise = () => {
    setShowExerciseModal(true);
  };

  const handleSaveExercise = async (exercise: {
    exerciseName: string;
    durationMinutes: number;
    caloriesBurned: number;
  }) => {
    try {
      await exerciseData.addExercise(
        exercise.exerciseName,
        exercise.durationMinutes,
        exercise.caloriesBurned,
        selectedDate
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add exercise');
      throw error;
    }
  };

  const handleDeleteExercise = async (exercise: any) => {
    try {
      await exerciseData.deleteExercise(exercise);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete exercise');
    }
  };

  const handleAddWater = async (amount: number) => {
    await waterData.addWater(amount, selectedDate);
  };

  const handleRemoveWater = async () => {
    await waterData.removeLastLog();
  };

  const handleAddWeight = async (weight: number, date: Date) => {
    await weightData.addWeightEntry(weight, date);
  };

  const totalCaloriesBurned = exerciseData.getTotalCaloriesBurned();
  const totalCaloriesConsumed = getTotalCalories();
  const totalMacros = getTotalMacros();
  const goalForDate = getGoalForDate(selectedDate);
  const unitSystem = getUnitSystem();

  const handleAddFood = (mealType: MealType) => {
    navigation.navigate('FoodSearch', { mealType, date: selectedDate, unitSystem });
  };

  const handleDeleteFood = async (mealType: MealType, log: FoodLog) => {
    try {
      await deleteFoodLog(mealType, log.logId);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete food log');
    }
  };

  const handleEditFood = (log: FoodLog) => {
    setSelectedFoodLog(log);
    setShowEditFoodModal(true);
  };

  const handleEditFoodSuccess = () => {
    Alert.alert('Success', 'Food log updated successfully!');
    setShowEditFoodModal(false);
    setSelectedFoodLog(null);
  };

  const handleDateChange = (event: any, selectedDateParam?: Date) => {
    if (selectedDateParam) {
      setSelectedDate(selectedDateParam);
    }
    setShowFullCalendar(false);
  };

  return (
    <View style={styles.container}>
      {isFoodLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Week Calendar */}
        <View style={styles.calendarSection}>
          <WeekCalendar
            selectedDate={selectedDate}
            onDateSelected={setSelectedDate}
            onRequestFullCalendar={() => setShowFullCalendar(true)}
            shouldAutoOpenCalendar={() => !showFullCalendar}
          />
        </View>

        {/* Swipeable Cards Section */}
        <View style={styles.cardsSection}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Calorie Card */}
            <View style={styles.cardContainer}>
              <CalorieSummaryCard
                calorieGoal={goalForDate?.calorieGoal || 2000}
                caloriesBurned={totalCaloriesBurned}
                caloriesConsumed={totalCaloriesConsumed}
                selectedDate={selectedDate}
              />
            </View>

            {/* Macro Card */}
            <View style={styles.cardContainer}>
              <MacroSummaryCard
                proteinConsumed={totalMacros.protein}
                proteinGoal={goalForDate?.proteinGoal || 150}
                carbsConsumed={totalMacros.carbs}
                carbsGoal={goalForDate?.carbsGoal || 200}
                fatConsumed={totalMacros.fat}
                fatGoal={goalForDate?.fatGoal || 65}
              />
            </View>
          </ScrollView>

          {/* Page Indicator Dots */}
          <View style={styles.pageIndicator}>
            {[0, 1].map((index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentCardIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Meal Cards Section */}
        <View style={styles.mealsSection}>
          <MealContainer
            mealLogs={mealLogs}
            onAddFood={handleAddFood}
            onDeleteFood={handleDeleteFood}
            onEditFood={handleEditFood}
          />
          <WaterCard
            waterConsumed={waterData.waterConsumed}
            waterGoal={waterData.waterGoal}
            waterProgress={waterData.getWaterProgress()}
            canRemoveWater={waterData.waterLogs.length > 0}
            onAddWater={handleAddWater}
            onRemoveWater={handleRemoveWater}
            unitSystem={unitSystem}
          />
          <ExerciseCard
            exercises={exerciseData.exercises}
            onAddExercise={handleAddExercise}
            onDeleteExercise={handleDeleteExercise}
          />
          <WeightCard
            latestWeight={weightData.getLatestWeight()}
            getWeightForPeriod={weightData.getWeightForPeriod}
            getWeightChange={weightData.getWeightChange}
            onAddWeight={handleAddWeight}
            unitSystem={unitSystem}
          />
        </View>
      </ScrollView>

      <AddExerciseModal
        visible={showExerciseModal}
        onClose={() => setShowExerciseModal(false)}
        onSave={handleSaveExercise}
      />

      {showFullCalendar && (
        <DateTimePicker
          testID="dateTimePicker"
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
        />
      )}

      {selectedFoodLog && (
        <FoodLogModal
          visible={showEditFoodModal}
          onClose={() => {
            setShowEditFoodModal(false);
            setSelectedFoodLog(null);
          }}
          mealType={selectedFoodLog.mealType as MealType}
          date={selectedFoodLog.consumedAt}
          unitSystem={unitSystem}
          onSuccess={handleEditFoodSuccess}
          existingLog={selectedFoodLog}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  calendarSection: {
    marginTop: 12,
    marginBottom: 8,
  },
  cardsSection: {
    marginTop: 12,
  },
  cardContainer: {
    width: screenWidth,
    paddingHorizontal: 16,
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    marginBottom: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D1D6',
  },
  activeDot: {
    backgroundColor: '#007AFF',
  },
  mealsSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
});
