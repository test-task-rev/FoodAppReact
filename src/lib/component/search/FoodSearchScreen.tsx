import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { useFoodSearch } from '../../hooks/useFoodSearch';
import { useLocalSearch } from '../../hooks/useLocalSearch';
import { FoodItem } from '../../types/FoodItem';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { MealType } from '../../types/MealType';
import { FoodLogModal } from '../modals/FoodLogModal';

export const FoodSearchScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { mealType: initialMealType, date: entryDate = new Date(), unitSystem = 'metric' } = route.params as {
    mealType: MealType;
    date?: Date;
    unitSystem?: 'metric' | 'imperial';
  };

  const [currentMealType, setCurrentMealType] = useState<MealType>(initialMealType);
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [myFoodItems, setMyFoodItems] = useState<FoodItem[]>([]);
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);

  const mealTypes = [MealType.Breakfast, MealType.Lunch, MealType.Dinner, MealType.Snack];

  // Helper function to get display name from MealType enum
  const getMealTypeDisplayName = (mealType: MealType): string => {
    switch (mealType) {
      case MealType.Breakfast:
        return 'Breakfast';
      case MealType.Lunch:
        return 'Lunch';
      case MealType.Dinner:
        return 'Dinner';
      case MealType.Snack:
        return 'Snack';
    }
  };

  // Set custom header with dropdown
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: 'center',
      headerTitle: () => (
        <TouchableOpacity
          style={styles.headerDropdown}
          onPress={() => setShowMealTypeDropdown(!showMealTypeDropdown)}
        >
          <Text style={styles.headerTitle}>{getMealTypeDisplayName(currentMealType)}</Text>
          <Icon
            name={showMealTypeDropdown ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#007AFF"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, currentMealType, showMealTypeDropdown]);

  const allFoodsSearch = useFoodSearch({
    debounceMs: 500,
    minQueryLength: 2,
    limit: 20,
  });

  const myFoodsSearch = useLocalSearch(myFoodItems, 'foodName');

  const currentSearch = selectedTab === 0 ? allFoodsSearch : myFoodsSearch;

  const handleScanFood = () => {
    console.log('Scan food');
  };

  const handleBarcodeScan = () => {
    console.log('Barcode scan');
  };

  const handleQuickLog = () => {
    setShowQuickLogModal(true);
  };

  const handleFoodLogSuccess = () => {
    Alert.alert('Success', 'Food logged successfully!');
  };

  const handleCreateFood = () => {
    console.log('Create custom food');
  };

  const renderFoodItem = (item: FoodItem) => {
    return (
      <TouchableOpacity
        style={styles.foodItem}
        onPress={() =>
          (navigation as any).navigate('FoodItemDetail', {
            foodItem: item,
            mealType: currentMealType,
            entryDate: entryDate,
            unitSystem: unitSystem,
            onSuccess: handleFoodLogSuccess,
          })
        }
      >
        <View style={styles.foodItemContent}>
          <Text style={styles.foodName}>{item.foodName}</Text>
          <Text style={styles.foodMacros}>
            {Math.round(item.calories)} cal · {Math.round(item.protein)}g protein
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  const renderTabContent = () => {
    if (selectedTab === 0) {
      // "All" tab content
      return (
        <>
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.scanButton]} onPress={handleScanFood}>
              <Icon name="camera" size={24} color="#34C759" />
              <Text style={[styles.actionButtonText, styles.scanButtonText]}>Scan Food</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.barcodeButton]} onPress={handleBarcodeScan}>
              <Icon name="barcode" size={24} color="#FF9500" />
              <Text style={[styles.actionButtonText, styles.barcodeButtonText]}>Barcode</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.quickLogButton]} onPress={handleQuickLog}>
              <Icon name="create" size={24} color="#AF52DE" />
              <Text style={[styles.actionButtonText, styles.quickLogButtonText]}>Quick Log</Text>
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          <SearchResults
            searchTerm={currentSearch.searchTerm}
            results={currentSearch.results}
            isSearching={currentSearch.isSearching}
            error={currentSearch.error}
            renderItem={renderFoodItem}
            emptyMessage="No foods found"
          />
        </>
      );
    } else {
      // "My Food" tab content
      return (
        <>
          {/* Create Food Button */}
          <View style={styles.createFoodContainer}>
            <TouchableOpacity style={styles.createFoodButton} onPress={handleCreateFood}>
              <Icon name="add-circle" size={20} color="#FFF" />
              <Text style={styles.createFoodButtonText}>Create Food</Text>
            </TouchableOpacity>
          </View>

          {/* Search Results */}
          <SearchResults
            searchTerm={currentSearch.searchTerm}
            results={currentSearch.results}
            isSearching={currentSearch.isSearching}
            error={currentSearch.error}
            renderItem={renderFoodItem}
            emptyMessage="No custom foods found"
          />
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Meal Type Dropdown Menu */}
      {showMealTypeDropdown && (
        <View style={styles.dropdownMenu}>
          {mealTypes.map((mealType) => (
            <TouchableOpacity
              key={mealType}
              style={[
                styles.dropdownItem,
                currentMealType === mealType && styles.dropdownItemActive,
              ]}
              onPress={() => {
                setCurrentMealType(mealType);
                setShowMealTypeDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemText,
                  currentMealType === mealType && styles.dropdownItemTextActive,
                ]}
              >
                {getMealTypeDisplayName(mealType)}
              </Text>
              {currentMealType === mealType && (
                <Icon name="checkmark" size={20} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search Input - Always visible at top */}
      <SearchInput
        searchTerm={currentSearch.searchTerm}
        onSearchChange={currentSearch.setSearchTerm}
        onClear={currentSearch.clearSearch}
        placeholder={selectedTab === 0 ? 'Search foods...' : 'Search your food...'}
      />

      {/* Segmented Control */}
      <View>
        <SegmentedControlTab
          values={['All', 'My Food']}
          selectedIndex={selectedTab}
          onTabPress={(index) => setSelectedTab(index)}
          tabsContainerStyle={styles.tabsContainerStyle}
          tabStyle={styles.tabStyle}
          activeTabStyle={styles.activeTabStyle}
          tabTextStyle={styles.tabTextStyle}
          activeTabTextStyle={styles.activeTabTextStyle}
        />
      </View>

      {/* Tab Content with Buttons and Results */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>

      {/* Quick Log Modal */}
      <FoodLogModal
        visible={showQuickLogModal}
        onClose={() => setShowQuickLogModal(false)}
        mealType={currentMealType}
        date={entryDate}
        unitSystem={unitSystem}
        onSuccess={handleFoodLogSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginRight: 4,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dropdownItemActive: {
    backgroundColor: '#F2F2F7',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#000',
  },
  dropdownItemTextActive: {
    fontWeight: '600',
    color: '#007AFF',
  },
  tabsContainerStyle: {
    borderWidth: 0,
    backgroundColor: '#E5E5EA',
    borderTopEndRadius: 10
  },
  tabStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  activeTabStyle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 0,
  },
  tabTextStyle: {
    color: '#000000',
    fontWeight: '400',
  },
  activeTabTextStyle: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 4,
  },
  scanButton: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  barcodeButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
  },
  quickLogButton: {
    backgroundColor: 'rgba(175, 82, 222, 0.15)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scanButtonText: {
    color: '#34C759',
  },
  barcodeButtonText: {
    color: '#FF9500',
  },
  quickLogButtonText: {
    color: '#AF52DE',
  },
  createFoodContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    alignItems: 'center',
  },
  createFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
  },
  createFoodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  foodItemContent: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  foodMacros: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
