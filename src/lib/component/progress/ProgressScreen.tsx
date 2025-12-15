import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useProgressData } from '../../hooks/useProgressData';
import { CaloriePeriod } from '../../types/Progress';
import { CalorieSummaryCard } from './cards/CalorieSummaryCard';
import { StreakCard } from './cards/StreakCard';
import { CalorieTrendChart } from './charts/CalorieTrendChart';
import { MacroComplianceChart } from './charts/MacroComplianceChart';
import { ActivityPerformanceChart } from './charts/ActivityPerformanceChart';
import { Card } from '../core/Card';
import { AppColors } from '../../theme/colors';

export const ProgressScreen: React.FC = () => {
  const {
    calorieEntries,
    macroEntries,
    activityEntries,
    userGoals,
    stats,
    selectedPeriod,
    isLoading,
    error,
    setSelectedPeriod,
    refresh,
  } = useProgressData();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {[CaloriePeriod.ThirtyDays, CaloriePeriod.SixtyDays, CaloriePeriod.NinetyDays].map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            selectedPeriod === period && styles.periodButtonActive,
          ]}
          onPress={() => setSelectedPeriod(period)}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === period && styles.periodButtonTextActive,
            ]}
          >
            {period}D
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading && calorieEntries.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={AppColors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Progress</Text>
          <Text style={styles.headerSubtitle}>Track your nutrition journey</Text>
        </View>

        {/* Error Message */}
        {error && (
          <Card style={styles.errorCard}>
            <Icon name="alert-circle" size={32} color={AppColors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Summary Cards */}
        <View style={styles.section}>
          <CalorieSummaryCard
            averageCalories={stats.averageCalories}
            calorieGoal={userGoals.calorieGoal}
          />
        </View>

        {/* Calorie Trend Chart */}
        <View style={styles.section}>
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Calorie Trend</Text>
              {renderPeriodSelector()}
            </View>
            <CalorieTrendChart
              entries={calorieEntries}
              calorieGoal={userGoals.calorieGoal}
              period={selectedPeriod}
            />
          </Card>
        </View>

        {/* Streak Card */}
        <View style={styles.section}>
          <StreakCard loggingStreak={stats.loggingStreak} />
        </View>

        {/* Macro Compliance Chart */}
        <View style={styles.section}>
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleContainer}>
                <Icon name="nutrition" size={20} color={AppColors.primary} />
                <Text style={styles.chartTitle}>Macro Compliance</Text>
              </View>
            </View>
            <MacroComplianceChart
              entries={macroEntries}
              period={selectedPeriod}
            />
            <Text style={styles.chartHint}>
              Average adherence to your daily macro goals
            </Text>
          </Card>
        </View>

        {/* Activity Performance Chart */}
        <View style={styles.section}>
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleContainer}>
                <Icon name="dumbbell" size={20} color={AppColors.primary} />
                <Text style={styles.chartTitle}>Activity Performance</Text>
              </View>
            </View>
            <ActivityPerformanceChart
              entries={activityEntries}
              period={selectedPeriod}
            />
            <Text style={styles.chartHint}>
              Exercise calories and meal logging consistency
            </Text>
          </Card>
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: AppColors.secondaryLabel,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: AppColors.label,
  },
  headerSubtitle: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  errorCard: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFF3F0',
    borderColor: AppColors.error,
    borderWidth: 1,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: AppColors.error,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    marginTop: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  chartCard: {
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
  },
  chartHint: {
    fontSize: 12,
    color: AppColors.tertiaryLabel,
    marginTop: 8,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: AppColors.tertiaryBackground,
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: AppColors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.secondaryLabel,
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 100,
  },
});
