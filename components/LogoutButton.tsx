import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../store/auth-store';
import { theme } from '../constants/theme';

export default function LogoutButton({ style }: { style?: any }) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const confirmLogout = Platform.OS === 'web' 
      ? window.confirm('Are you sure you want to log out?')
      : await new Promise((resolve) => {
          Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
              { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
              { text: 'Logout', onPress: () => resolve(true), style: 'destructive' },
            ],
            { cancelable: false }
          );
        });

    if (!confirmLogout) return;

    setIsLoading(true);
    try {
      await logout();
      // Navigate to login screen
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      if (Platform.OS === 'web') {
        alert('Failed to logout: ' + errorMessage);
      } else {
        Alert.alert('Error', 'Failed to logout: ' + errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.logoutButton, style]}
      onPress={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={styles.logoutText}>Logout</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});