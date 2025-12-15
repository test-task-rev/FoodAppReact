import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface WeekCalendarProps {
  selectedDate: Date;
  onDateSelected: (date: Date) => void;
  onRequestFullCalendar?: () => void;
  shouldAutoOpenCalendar?: () => boolean;
}

interface DayData {
  date: Date;
  dayName: string;
  dayNumber: string;
  isToday: boolean;
  isSelected: boolean;
}

export const WeekCalendar: React.FC<WeekCalendarProps> = ({
  selectedDate,
  onDateSelected,
  onRequestFullCalendar,
  shouldAutoOpenCalendar = () => true,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [hasAppeared, setHasAppeared] = useState(false);
  const [showTodayButton, setShowTodayButton] = useState(false);
  const todayButtonOpacity = useRef(new Animated.Value(0)).current;

  const days = useGenerateDays(selectedDate);

  useEffect(() => {
    const shouldShow = !isToday(selectedDate);
    setShowTodayButton(shouldShow);

    Animated.timing(todayButtonOpacity, {
      toValue: shouldShow ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [selectedDate, todayButtonOpacity]);

  useEffect(() => {
    if (!scrollViewRef.current) return;

    const selectedIndex = days.findIndex(day =>
      isSameDay(day.date, selectedDate)
    );

    if (selectedIndex === -1) {
      // Date is outside the current window
      // Check if we should auto-open the full calendar
      if (shouldAutoOpenCalendar()) {
        onRequestFullCalendar?.();
      }
      return;
    }

    const ITEM_WIDTH = 58;
    const scrollPosition = selectedIndex * ITEM_WIDTH - (ITEM_WIDTH * 2);

    const delay = hasAppeared ? 0 : 100;

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        x: Math.max(0, scrollPosition),
        animated: hasAppeared,
      });

      if (!hasAppeared) {
        setTimeout(() => setHasAppeared(true), 200);
      }
    }, delay);
  }, [selectedDate, days, hasAppeared, shouldAutoOpenCalendar, onRequestFullCalendar]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!hasAppeared) return;

    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollX = contentOffset.x;
    const scrollWidth = layoutMeasurement.width;
    const contentWidth = contentSize.width;

    const EDGE_THRESHOLD = 50;

    if (scrollX < EDGE_THRESHOLD || scrollX > contentWidth - scrollWidth - EDGE_THRESHOLD) {
      onRequestFullCalendar?.();
    }
  }, [hasAppeared, onRequestFullCalendar]);

  const handleTodayPress = useCallback(() => {
    onDateSelected(new Date());
  }, [onDateSelected]);

  const monthYearText = formatMonthYear(selectedDate);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.monthYearText}>{monthYearText}</Text>

        <Animated.View style={{ opacity: todayButtonOpacity }}>
          <TouchableOpacity
            style={styles.todayButton}
            onPress={handleTodayPress}
            disabled={!showTodayButton}
            activeOpacity={0.7}
          >
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {days.map((day, index) => (
          <DayButton
            key={day.date.toISOString()}
            day={day}
            onPress={() => onDateSelected(day.date)}
            isFirst={index === 0}
            isLast={index === days.length - 1}
          />
        ))}
      </ScrollView>
    </View>
  );
};


const DayButton: React.FC<{
  day: DayData;
  onPress: () => void;
  isFirst: boolean;
  isLast: boolean;
}> = React.memo(({ day, onPress, isFirst, isLast }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.dayButtonWrapper,
        isFirst && styles.dayButtonFirst,
        isLast && styles.dayButtonLast,
        { transform: [{ scale: scaleValue }] },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.dayButton,
          day.isSelected && styles.dayButtonSelected,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text
          style={[
            styles.dayName,
            day.isSelected && styles.dayNameSelected,
          ]}
        >
          {day.dayName}
        </Text>
        <Text
          style={[
            styles.dayNumber,
            day.isSelected && styles.dayNumberSelected,
            day.isToday && !day.isSelected && styles.dayNumberToday,
          ]}
        >
          {day.dayNumber}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

DayButton.displayName = 'DayButton';

function useGenerateDays(selectedDate: Date): DayData[] {
  return React.useMemo(() => {
    const days: DayData[] = [];
    const today = new Date();

    // Generate 30 days: 15 before, 15 after
    for (let i = -15; i <= 14; i++) {
      const date = addDays(selectedDate, i);
      days.push({
        date,
        dayName: formatDayName(date),
        dayNumber: formatDayNumber(date),
        isToday: isToday(date),
        isSelected: isSameDay(date, selectedDate),
      });
    }

    return days;
  }, [selectedDate]);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function formatDayName(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

function formatDayNumber(date: Date): string {
  return date.getDate().toString();
}

function formatMonthYear(date: Date): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.label,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${AppColors.primary}1A`,
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.primary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  dayButtonWrapper: {
    marginRight: Spacing.xs,
  },
  dayButtonFirst: {
    marginLeft: 0,
  },
  dayButtonLast: {
    marginRight: 0,
  },
  dayButton: {
    width: 50,
    height: 60,
    borderRadius: 12,
    backgroundColor: AppColors.secondaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dayButtonSelected: {
    backgroundColor: AppColors.primary,
    ...Platform.select({
      ios: {
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  dayName: {
    fontSize: 11,
    fontWeight: '500',
    color: AppColors.secondaryLabel,
    marginBottom: 4,
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.label,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  dayNumberToday: {
    color: AppColors.primary,
  },
});
