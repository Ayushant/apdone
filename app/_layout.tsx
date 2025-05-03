import '@/utils/polyfills';
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { useCoinsStore } from "@/store/coins-store";
import { theme } from "@/constants/theme";
import { ErrorBoundary } from "./error-boundary";
import { subscribeToUserProfile } from '@/firebaseConfig';
import { auth } from '@/firebaseConfig';

interface UserProfileData {
  coins: number;
  achievements: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

function RootLayout() {
  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, hasCompletedOnboarding, user } = useAuthStore();
  const { initializeCoins } = useCoinsStore();
  const systemColorScheme = useColorScheme() || "light";
  const { theme: storedTheme } = useThemeStore();
  const activeTheme = storedTheme || systemColorScheme;
  const colors = theme[activeTheme];

  // Initialize coin subscription when user is authenticated
  useEffect(() => {
    if (user?.uid && !user.isGuest) {
      initializeCoins(user.uid);
    }
  }, [user?.uid, user?.isGuest]);

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      // Get the current segment to determine route group
      const currentSegment = segments[0] || "";
      
      // Check if we're in a protected group that requires auth
      const requiresAuth = !["(auth)", "(onboarding)"].includes(currentSegment);

      // Check if user is already logged in via Firebase
      const currentUser = auth.currentUser;

      if (!hasCompletedOnboarding) {
        // Always redirect to onboarding if not completed
        if (currentSegment !== "(onboarding)") {
          router.replace("/(onboarding)");
        }
      } else if (currentUser) {
        // If Firebase user exists, ensure they're in the protected area
        if (!requiresAuth) {
          router.replace("/(tabs)");
        }
      } else if (requiresAuth && !isAuthenticated) {
        // No Firebase user and trying to access protected route
        router.replace("/(auth)/login");
      }
    };

    checkAuthAndNavigate();
  }, [isAuthenticated, hasCompletedOnboarding, segments]);

  return (
    <Stack
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen 
        name="(auth)" 
        options={{ 
          headerShown: false,
          gestureEnabled: false 
        }} 
      />
      <Stack.Screen 
        name="(onboarding)" 
        options={{ 
          headerShown: false,
          gestureEnabled: false 
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          gestureEnabled: false 
        }} 
      />
      <Stack.Screen 
        name="game/[id]" 
        options={{ 
          presentation: "card",
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: false,
          gestureEnabled: true 
        }} 
      />
      <Stack.Screen 
        name="modal" 
        options={{ 
          presentation: "modal",
          gestureEnabled: true 
        }} 
      />
    </Stack>
  );
}

export default RootLayout;