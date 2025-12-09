import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { ActionSheet, ActionSheetOption } from './ActionSheet';
import { MealType } from '../../types/MealType';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleScanMeal = () => {
    console.log('Scan Meal');
  };

  const handleLogFood = () => {
    const mealType = getMealType();
    navigation.navigate('FoodSearch', { mealType });
  };

  const getMealType = (): MealType => {
    const now = new Date();
    const hours = now.getHours();

    if (hours >= 5 && hours < 11) return MealType.Breakfast;
    if (hours >= 11 && hours < 16) return MealType.Lunch;
    if (hours >= 16 && hours < 21) return MealType.Dinner;
    return MealType.Snack;
  }

  const actionSheetOptions: ActionSheetOption[] = [
    { label: 'Scan Meal', onPress: handleScanMeal },
    { label: 'Log Food', onPress: handleLogFood },
  ];

  // Map route names to icons
  const getIconName = (routeName: string, isFocused: boolean) => {
    const icons: { [key: string]: string } = {
      Home: 'home-outline',
      Progress: 'stats-chart-outline',
      Profile: 'person-outline',
    };
    return icons[routeName] || 'ellipse-outline';
  };

  return (
    <>
      <View style={styles.container}>
        {/* Tab Buttons Container */}
        <View style={styles.tabContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                style={[styles.button, isFocused && styles.buttonActive]}
                activeOpacity={0.7}
              >
                <Icon
                  name={getIconName(route.name, isFocused)}
                  size={20}
                  color={isFocused ? AppColors.primary : AppColors.secondaryLabel}
                />
                <Text
                  style={[styles.buttonText, isFocused && styles.buttonTextActive]}
                >
                  {typeof label === 'string' ? label : route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Large Plus Button */}
        <TouchableOpacity
          style={styles.addButtonContainer}
          onPress={() => setShowAddMenu(true)}
          activeOpacity={0.8}
        >
          <View style={styles.addButtonBackground}>
            <Icon name="add-circle" size={56} color={AppColors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Action Sheet */}
      <ActionSheet
        visible={showAddMenu}
        onClose={() => setShowAddMenu(false)}
        options={actionSheetOptions}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: AppColors.cardBackground,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  button: {
    minWidth: 70,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  buttonActive: {
    backgroundColor: `${AppColors.primary}1A`,
  },
  buttonText: {
    color: AppColors.secondaryLabel,
    fontWeight: '500',
    fontSize: 10,
    marginTop: 4,
  },
  buttonTextActive: {
    color: AppColors.primary,
  },
  addButtonContainer: {
    marginLeft: Spacing.md,
  },
  addButtonBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
});
