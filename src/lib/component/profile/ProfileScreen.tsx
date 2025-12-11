import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../core/Card';
import { ProfileSection } from './ProfileSection';
import { ProfileMenuItem } from './ProfileMenuItem';
import { useAuth } from '../../hooks/useAuth';
import { AppColors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

const APP_VERSION = '1.0.0';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const handleLogoutPress = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleProfilePress = () => {
    navigation.navigate('ProfileEdit' as never);
  };

  const handleGoalsPress = () => {
    navigation.navigate('Goals' as never);
  };

  const handlePermissionsPress = () => {
    // TODO: Navigate to permissions screen
    console.log('Navigate to Permissions');
  };

  const handleNotificationsPress = () => {
    // TODO: Navigate to notifications screen
    console.log('Navigate to Notifications');
  };

  const handlePrivacyPolicyPress = () => {
    // TODO: Navigate to privacy policy screen
    console.log('Navigate to Privacy Policy');
  };

  const handleTermsOfServicePress = () => {
    // TODO: Navigate to terms of service screen
    console.log('Navigate to Terms of Service');
  };

  const displayName = user?.displayName || 'User';

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <Card style={styles.userProfileCard}>
          <View style={styles.userProfileContent}>
            <Icon
              name="person-circle"
              size={60}
              color={AppColors.primary}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{displayName}</Text>
              <Text style={styles.userSubtitle}>Nutrition Tracker</Text>
            </View>
          </View>
        </Card>

        {/* Profile Section */}
        <ProfileSection>
          <ProfileMenuItem
            icon="person-circle-outline"
            title="Profile"
            onPress={handleProfilePress}
            testID="profile-menu-item"
          />
          <ProfileMenuItem
            icon="target-outline"
            title="Goals"
            onPress={handleGoalsPress}
            testID="goals-menu-item"
          />
        </ProfileSection>

        {/* Preferences Section */}
        <ProfileSection>
          <ProfileMenuItem
            icon="heart-outline"
            title="Permissions"
            onPress={handlePermissionsPress}
            testID="permissions-menu-item"
          />
          <ProfileMenuItem
            icon="notifications-outline"
            title="Notifications"
            onPress={handleNotificationsPress}
            testID="notifications-menu-item"
          />
        </ProfileSection>

        {/* About Section */}
        <ProfileSection>
          <ProfileMenuItem
            icon="hand-left-outline"
            title="Privacy Policy"
            onPress={handlePrivacyPolicyPress}
            testID="privacy-policy-menu-item"
          />
          <ProfileMenuItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={handleTermsOfServicePress}
            testID="terms-menu-item"
          />
          <ProfileMenuItem
            icon="information-circle-outline"
            title="Version"
            showChevron={false}
            rightContent={
              <Text style={styles.versionText}>{APP_VERSION}</Text>
            }
            testID="version-menu-item"
          />
        </ProfileSection>

        {/* Logout Button */}
        <Card style={styles.logoutCard}>
          <TouchableOpacity
            onPress={handleLogoutPress}
            activeOpacity={0.6}
            testID="logout-button"
            accessibilityRole="button"
            accessibilityLabel="Log Out"
          >
            <View style={styles.logoutButton}>
              <Icon
                name="log-out-outline"
                size={20}
                color={AppColors.error}
                style={styles.logoutIcon}
              />
              <Text style={styles.logoutText}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  userProfileCard: {
    padding: Spacing.md,
  },
  userProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.label,
    marginBottom: 2,
  },
  userSubtitle: {
    fontSize: 14,
    color: AppColors.secondaryLabel,
  },
  versionText: {
    fontSize: 16,
    color: AppColors.secondaryLabel,
  },
  logoutCard: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  logoutIcon: {
    marginRight: Spacing.xs,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '400',
    color: AppColors.error,
  },
});
