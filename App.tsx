/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { HomeScreen } from './src/lib/component/home/HomeScreen';
import { ProgressScreen } from './src/lib/component/progress/ProgressScreen';
import { ProfileScreen } from './src/lib/component/profile/ProfileScreen';
import { ProfileEditScreen } from './src/lib/component/profile/ProfileEditScreen';
import { DailySummaryScreen } from './src/lib/component/summary/DailySummaryScreen';
import { FoodSearchScreen } from './src/lib/component/search/FoodSearchScreen';
import { FoodItemDetailScreen } from './src/lib/component/search/FoodItemDetailScreen';
import { CustomTabBar } from './src/lib/component/core/CustomTabBar';
import { GoalsScreen } from './src/lib/component/goals/GoalsScreen';
import { FoodCameraScreen } from './src/lib/component/camera/FoodCameraScreen';

// Auth screens
import { WelcomeScreen } from './src/lib/component/auth/WelcomeScreen';
import { LoginScreen } from './src/lib/component/auth/LoginScreen';

// Onboarding
import { OnboardingNavigator } from './src/lib/component/onboarding/OnboardingNavigator';

// Hooks and Providers
import { AuthProvider, useAuth } from './src/lib/hooks/AuthProvider';
import { ProfileProvider } from './src/lib/hooks/ProfileProvider';
import { OnboardingProvider } from './src/lib/context/OnboardingContext';

// Navigation type definitions (exported for use in screens)
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Onboarding: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  DailySummary: { date?: Date };
  FoodSearch: undefined;
  FoodCamera: undefined;
  FoodItemDetail: {
    foodItem: any;
    mealType: string;
    entryDate: Date;
    unitSystem: 'metric' | 'imperial';
  };
  ProfileEdit: undefined;
  Goals: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AppStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

// Tab Navigator for authenticated users
function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Stack Navigator for authenticated users
function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DailySummary"
        component={DailySummaryScreen}
        options={{ title: 'Daily Summary' }}
      />
      <Stack.Screen
        name="FoodSearch"
        component={FoodSearchScreen}
        options={{ title: 'Search Food' }}
      />
      <Stack.Screen
        name="FoodCamera"
        component={FoodCameraScreen}
        options={{ title: 'Food Camera', headerShown: false }}
      />
      <Stack.Screen
        name="FoodItemDetail"
        component={FoodItemDetailScreen}
        options={{ title: 'Food Details' }}
      />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: 'Goals' }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator for unauthenticated users
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Onboarding" component={OnboardingNavigator} />
    </AuthStack.Navigator>
  );
}

// Root navigator that switches between auth and app
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <OnboardingProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </OnboardingProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default App;
