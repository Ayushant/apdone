import React, { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { theme } from "@/constants/theme";

interface RewardCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  colors: string[];
  onPress: () => void;
}

export function RewardCard({ title, description, icon, colors, onPress }: RewardCardProps) {
  const colorScheme = useColorScheme() || "light";
  const themeColors = theme[colorScheme];

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 4,
  },
  gradient: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 12,
  },
  title: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: "white",
    marginBottom: 4,
  },
  description: {
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
});