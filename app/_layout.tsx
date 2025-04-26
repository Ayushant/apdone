import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import { theme } from "@/constants/theme";
import { ErrorBoundary } from "./error-boundary";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <RootLayoutNav />
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();
  const systemColorScheme = useColorScheme() || "light";
  const { theme: storedTheme } = useThemeStore();
  const activeTheme = storedTheme || systemColorScheme;
  const colors = theme[activeTheme];

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!hasCompletedOnboarding && !inOnboardingGroup) {
      router.replace("/(onboarding)");
    } else if (
      !isAuthenticated && 
      !inAuthGroup && 
      !inOnboardingGroup && 
      hasCompletedOnboarding
    ) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && (inAuthGroup || inOnboardingGroup)) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, hasCompletedOnboarding, segments]);

  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: colors.background }
    }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="game/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}