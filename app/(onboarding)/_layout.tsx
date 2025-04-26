import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { theme } from "@/constants/theme";

export default function OnboardingLayout() {
  const colorScheme = useColorScheme() || "light";
  const colors = theme[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}